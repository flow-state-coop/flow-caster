"use client";

import { useState, useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import { encodeFunctionData, formatUnits, parseEther, parseUnits } from "viem";
import sdk from "@farcaster/miniapp-sdk";
import {
  useAccount,
  useConnect,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useReadSuperToken } from "@sfpro/sdk/hook";
import { superTokenAbi } from "@sfpro/sdk/abi";
import erc20Abi from "@/lib/abi/erc20.json";
import hostAbi from "@/lib/abi/sfHost.json";
import gdaAbi from "@/lib/abi/gdaV1.json";
import { useUser } from "@/contexts/user-context";
import { usePoolData } from "@/hooks/use-pool-data";
import { usePool } from "@/contexts/pool-context";
import { DEV_DONATION_PERCENT, ZERO_ADDRESS } from "@/lib/constants";
import {
  Operation,
  OPERATION_TYPE,
  prepareOperation,
} from "@sfpro/sdk/constant";
import {
  calculateFlowratePerSecond,
  ratePerMonthFormattedNoLocale,
  TIME_UNIT,
  truncateString,
} from "@/lib/pool";
import { networks } from "@/lib/flowapp/networks";
import { PoolData } from "@/lib/types";
import { openExplorerUrl, shareContent } from "@/lib/helpers";
import BaseButton from "../Shared/BaseButton";
import { config } from "@/contexts/miniapp-wallet-context";

interface OpenStreamProps {
  chainId: string;
  poolId: string;
  poolAddress: string;
  connectedDonor?: PoolData["poolDistributors"][0];
  handleCloseDrawer: () => void;
  isOpen: boolean;
  activeMemberCount?: number;
}

export default function OpenStream({
  chainId,
  poolId,
  poolAddress,
  connectedDonor,
  handleCloseDrawer,
  isOpen,
  activeMemberCount,
}: OpenStreamProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [monthlyDonation, setMonthlyDonation] = useState<string>("0");
  const [wrapAmount, setWrapAmount] = useState<string>("");
  const [donateToDevs, setDonateToDevs] = useState<boolean>(true);
  const [currentMonthlyRate, setCurrentMonthlyRate] = useState<
    string | undefined
  >();
  const [currentDevDonor, setCurrentDevDonor] = useState(false);

  const { address, chainId: connectedChainId, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { user } = useUser();
  const { switchChain } = useSwitchChain();
  const { getCurrentPoolData } = usePool();
  const currentPoolData = getCurrentPoolData();

  const { refetch, data: poolData } = usePoolData({
    chainId,
    poolId,
  });
  const { data: devPoolData } = usePoolData({
    chainId,
    poolId: currentPoolData.DEV_POOL_ID,
  });

  console.log("status", status);
  const isConnected = status === "connected";

  const {
    writeContract: approve,
    data: approvalHash,
    reset: resetApproval,
  } = useWriteContract();
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } =
    useWaitForTransactionReceipt({
      hash: approvalHash,
    });

  const {
    writeContract: batchCall,
    data: batchHash,
    reset: resetBatch,
  } = useWriteContract({
    config: config,
  });
  const { isLoading: isBatchConfirming, isSuccess: isBatchSuccess } =
    useWaitForTransactionReceipt({
      hash: batchHash,
    });

  // const tokenData = TOKEN_DATA[chainId];

  // Fetch SuperToken balance
  const { data: superTokenBalance } = useReadSuperToken({
    address: poolData?.token.id as `0x${string}`,
    // address: tokenData.address,s
    functionName: "balanceOf",
    args: [address || ZERO_ADDRESS],
  });

  // Fetch underlying token balance
  const { data: underlyingBalance } = useReadContract({
    // address: tokenData.underlyingAddress as `0x${string}`,
    address: poolData?.token.underlyingAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address || ZERO_ADDRESS],
  }) as { data: bigint | undefined };

  // Fetch underlying token allowance for SuperToken contract
  const { data: underlyingAllowance } = useReadContract({
    // address: tokenData.underlyingAddress as `0x${string}`,
    address: poolData?.token.underlyingAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address || ZERO_ADDRESS, poolData?.token.id],
  }) as { data: bigint | undefined };

  const userBalance = superTokenBalance
    ? Number(formatUnits(superTokenBalance, 18))
    : 0;
  const usdcBalance = underlyingBalance
    ? Number(
        formatUnits(
          underlyingBalance,
          poolData?.token.underlyingToken.decimals || 18
        )
      )
    : 0;

  // Validation logic
  const monthlyDonationAmount = parseFloat(monthlyDonation) || 0;
  const wrapAmountValue = parseFloat(wrapAmount) || 0;
  const totalSuperTokenBalance = userBalance + wrapAmountValue;
  const isMonthlyDonationEmpty =
    !currentMonthlyRate && monthlyDonationAmount === 0;
  const twoDayDonationAmount = (monthlyDonationAmount / 30) * 2;
  const isInsufficientBalance =
    monthlyDonationAmount > 0 && totalSuperTokenBalance < twoDayDonationAmount;
  const isWrapAmountExceedsBalance = wrapAmountValue > usdcBalance;
  const isButtonDisabled =
    isMonthlyDonationEmpty ||
    isInsufficientBalance ||
    isWrapAmountExceedsBalance;

  useEffect(() => {
    if (!connectedDonor || !address || !devPoolData || !isOpen) return;

    const donor = devPoolData.poolDistributors.find((d) => {
      return d.account.id.toLowerCase() === address.toLowerCase();
    });
    setCurrentDevDonor(!!donor);
    setDonateToDevs(!!donor);

    const totalFlowRate = donor
      ? (BigInt(donor.flowRate) + BigInt(connectedDonor.flowRate)).toString()
      : connectedDonor.flowRate;
    const rate = ratePerMonthFormattedNoLocale(totalFlowRate);
    setCurrentMonthlyRate(rate);
    setMonthlyDonation(rate);
  }, [connectedDonor, devPoolData, address, isOpen]);

  const handleCancel = () => {
    setWrapAmount("0");
    setMonthlyDonation("0");
    proceedWithMainTransaction(true);
  };

  const handleConnect = () => {
    connect({ connector: connectors[0] });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setError(null);

    if (!connectors[0] || typeof connectors[0].getChainId !== "function") {
      setError("Wallet connector not ready. Please refresh and try again.");
      setIsLoading(false);
      return;
    }

    if (Number(chainId) !== connectedChainId) {
      try {
        await switchChain({ chainId: Number(chainId) });
      } catch (error) {
        console.error("Chain switching failed:", error);
        setError("Failed to switch chain. Please try again.");
        setIsLoading(false);
        return;
      }
    }

    const wrapAmountValue = parseEther(wrapAmount);

    const currentAllowance = Number(underlyingAllowance) || 0;

    // Step 1: Handle approval if needed
    if (wrapAmountValue > 0 && currentAllowance < wrapAmountValue) {
      setIsConfirming(true);
      approve(
        {
          // address: tokenData.underlyingAddress as `0x${string}`,
          address: poolData?.token.underlyingAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "approve",
          args: [
            poolData?.token.id,
            parseUnits(
              wrapAmount,
              poolData?.token.underlyingToken.decimals || 18
            ),
          ],
        },
        {
          onSuccess: () => {
            console.log("Approval transaction sent successfully");
            // The approval will be handled by the useWaitForTransactionReceipt hook
          },
          onError: (error) => {
            console.error("Approval failed:", error);
            setError(`Approval failed: ${error.message}`);
            setIsLoading(false);
            setIsConfirming(false);
          },
        }
      );
    } else {
      // No approval needed, proceed with main transaction
      proceedWithMainTransaction(false);
    }
  };

  // Step 2: Handle main transaction after approval
  const proceedWithMainTransaction = async (cancel?: boolean) => {
    setIsSuccess(false);
    setIsLoading(false);
    setIsConfirming(true);

    const network = networks.find((network) => network.id === Number(chainId));

    if (!network || !address) {
      setError("Network or sender address not found");
      return;
    }

    let operations: Operation[] = [];
    const _wrapAmount = cancel ? "0" : wrapAmount;
    const wrapAmountValue = parseEther(_wrapAmount);

    if (wrapAmountValue > 0) {
      console.log("adding upgrade/wrap function");
      operations = [
        prepareOperation({
          operationType: OPERATION_TYPE.SUPERTOKEN_UPGRADE,
          target: poolData?.token.id as `0x${string}`,
          data: encodeFunctionData({
            abi: superTokenAbi,
            functionName: "upgrade",
            args: [wrapAmountValue],
          }),
        }),
      ];
    }

    // handle 0 submission for existing stream
    const _monthlyDonation =
      cancel || monthlyDonation === "" ? "0" : monthlyDonation;
    let poolMonthlyDonation = parseFloat(_monthlyDonation);

    const zeroOutDevDonation =
      (poolMonthlyDonation == 0 && currentDevDonor) ||
      (currentDevDonor && !donateToDevs);

    if (donateToDevs || zeroOutDevDonation) {
      const devMonthlyDonation = zeroOutDevDonation
        ? 0
        : parseFloat(_monthlyDonation) * (DEV_DONATION_PERCENT / 100);
      poolMonthlyDonation = parseFloat(_monthlyDonation) - devMonthlyDonation;

      const devFlowRate = calculateFlowratePerSecond({
        amountWei: parseEther(devMonthlyDonation.toString()),
        timeUnit: TIME_UNIT["month"],
      });

      operations = [
        ...operations,
        prepareOperation({
          operationType: OPERATION_TYPE.SUPERFLUID_CALL_AGREEMENT,
          target: network.gdaV1,
          data: encodeFunctionData({
            abi: gdaAbi,
            functionName: "distributeFlow",
            args: [
              poolData?.token.id as `0x${string}`,
              address,
              currentPoolData.DEV_POOL_ADDRESS as `0x${string}`,
              devFlowRate,
              "0x",
            ],
          }),
        }),
      ];
    }

    const poolFlowRate = calculateFlowratePerSecond({
      amountWei: parseEther(poolMonthlyDonation.toString()),
      timeUnit: TIME_UNIT["month"],
    });

    operations = [
      ...operations,
      prepareOperation({
        operationType: OPERATION_TYPE.SUPERFLUID_CALL_AGREEMENT,
        target: network.gdaV1,
        data: encodeFunctionData({
          abi: gdaAbi,
          functionName: "distributeFlow",
          args: [
            poolData?.token.id as `0x${string}`,
            address,
            poolAddress as `0x${string}`,
            poolFlowRate,
            "0x",
          ],
        }),
      }),
    ];

    batchCall(
      {
        address: network.superfluidHost,
        abi: hostAbi,
        functionName: "batchCall",
        args: [operations],
      },
      {
        onSuccess: () => {
          console.log("batch transaction sent successfully");
          // The approval will be handled by the useWaitForTransactionReceipt hook
        },
        onError: (error) => {
          console.error("batch failed:", error);
          setError(`batch failed: ${error.message}`);
          setIsLoading(false);
          setIsConfirming(false);
        },
      }
    );
  };

  // Monitor approval transaction completion
  useEffect(() => {
    if (isApprovalSuccess && isApprovalConfirming === false) {
      console.log(
        "Approval transaction confirmed, proceeding with main transaction"
      );
      setIsConfirming(false);
      proceedWithMainTransaction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApprovalSuccess, isApprovalConfirming]);

  // Monitor batch transaction completion
  useEffect(() => {
    if (isBatchSuccess && isBatchConfirming === false) {
      if (Number(monthlyDonation) > 99) {
        const options = {
          method: "POST",
          body: JSON.stringify({
            poolid: poolId,
            chainid: chainId,
            poolname: "Farcaster Cracked Devs",
            username: user?.data?.username || "A mystery donor",
            flowrate: monthlyDonation,
          }),
        };
        fetch(`/api/notify-donation`, options);
      }

      setTimeout(() => {
        setIsConfirming(false);
        setIsSuccess(true);
        refetch();
      }, 4000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBatchSuccess, isBatchConfirming]);

  const handleCast = async () => {
    let targetUrl = `${process.env.NEXT_PUBLIC_URL}/pool/${chainId}/${poolId}/donation?flowRate=${monthlyDonationAmount}`;

    if (user?.data?.fid) {
      targetUrl += `&fid=${user.data.fid}`;
    }

    await sdk.actions.composeCast({
      text: shareContent(`${chainId}-${poolId}`),
      embeds: [targetUrl],
    });
  };

  const closeDrawer = () => {
    if (!isConfirming && !isLoading) {
      setIsLoading(false);
      setIsConfirming(false);
      setError(null);
      setIsSuccess(false);
      resetApproval();
      resetBatch();
    }
    handleCloseDrawer();
  };

  const getButtonText = () => {
    if (isLoading) return "Preparing...";
    if (isConfirming || isApprovalConfirming || isBatchConfirming)
      return "Confirming...";
    if (isSuccess) return "Success!";
    if (isMonthlyDonationEmpty) return "Add streaming amount";
    if (isWrapAmountExceedsBalance)
      return `${poolData?.token.underlyingToken.symbol} balance too low`;
    if (isInsufficientBalance)
      return `${poolData?.token.symbol} balance too low. Wrap ${poolData?.token.underlyingToken.symbol}.`;
    if (connectedDonor) return "Edit Stream";
    return "Open Stream";
  };

  const getDrawerTitle = () => {
    if (isSuccess) return "Success! 🫡";
    if (Number(connectedDonor?.flowRate) > 0) return "Edit Stream";
    return "Open Stream";
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-accent-800">
          {getDrawerTitle()}
        </h2>
        <button
          onClick={closeDrawer}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isSuccess && (
            <>
              <div>
                <label
                  htmlFor="monthlyDonation"
                  className="block text-sm font-medium text-primary-800 mb-2"
                >
                  How much do you want to stream per month?
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="monthlyDonation"
                    value={monthlyDonation}
                    onChange={(e) => setMonthlyDonation(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-black px-4 py-3 pr-20 rounded-lg border border-primary-300 focus:ring-2 focus:ring-secondary-800 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm font-medium">
                      {poolData?.token.symbol}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-primary-700">
                  Streaming token ({poolData?.token.symbol}) balance:{" "}
                  {userBalance.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div>
                <label
                  htmlFor="wrapAmount"
                  className="block text-sm font-medium text-primary-800 mb-2"
                >
                  How much {poolData?.token.underlyingToken.symbol} should we
                  wrap to fund your stream?
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="wrapAmount"
                    value={wrapAmount}
                    onChange={(e) => setWrapAmount(e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full text-black px-4 py-3 pr-20 rounded-lg border border-primary-300 focus:ring-2 focus:ring-secondary-800 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm font-medium">
                      {poolData?.token.underlyingToken.symbol}{" "}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-primary-700">
                  {poolData?.token.underlyingToken.symbol} balance:{" "}
                  {usdcBalance.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </p>
                <div className="border border-primary-400 bg-primary-100 rounded-lg px-2 py-2 mt-2 text-xs">
                  <p className="text-primary-800 font-bold">
                    Your stream will last until your {poolData?.token.symbol}{" "}
                    balance is depleted. You can wrap/unwrap more any time.{" "}
                  </p>
                  <p className="mt-2 text-primary-800 font-normal">
                    {(() => {
                      const currentBalance = userBalance;
                      const wrapAmountValue = parseFloat(wrapAmount) || 0;
                      const monthlyAmount = parseFloat(monthlyDonation) || 0;
                      const totalBalance = currentBalance + wrapAmountValue;

                      if (monthlyAmount > 0 && totalBalance > 0) {
                        const monthsSupported = totalBalance / monthlyAmount;
                        if (monthsSupported >= 1) {
                          return `Proposed runway: ${monthsSupported.toLocaleString(
                            "en-US",
                            {
                              maximumFractionDigits: 2,
                            }
                          )} months.`;
                        } else {
                          const daysSupported = Math.floor(
                            monthsSupported * 30
                          );
                          return `Proposed runway: ${daysSupported} days.`;
                        }
                      } else if (monthlyAmount === 0) {
                        return "Enter a monthly amount to see runway.";
                      } else {
                        return "Wrap some tokens to fund your stream.";
                      }
                    })()}
                  </p>
                </div>
                {(() => {
                  const currentAllowance = Number(underlyingAllowance) || 0;
                  const wrapAmountValue = parseUnits(
                    wrapAmount,
                    poolData?.token.underlyingToken.decimals || 18
                  );

                  if (
                    wrapAmountValue > 0 &&
                    currentAllowance < wrapAmountValue
                  ) {
                    return (
                      <div className="border border-accent-400 bg-accent-100 rounded-lg px-2 py-2 mt-2 text-xs">
                        <p className="text-xs text-accent-800">
                          There will be an approval request allowing wrapping of{" "}
                          {poolData?.token.underlyingToken.symbol}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Donate to flowcaster devs */}
              <div>
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="donateToDevs"
                    checked={donateToDevs}
                    onChange={(e) => setDonateToDevs(e.target.checked)}
                    className="h-4 w-4 focus:ring-white border-accent-300 rounded accent-white"
                  />
                  <label
                    htmlFor="donateToDevs"
                    className="ml-2 block text-sm font-medium text-primary-800"
                  >
                    Donate 5% to the Flow Caster devs
                  </label>
                </div>
              </div>

              {error && (
                <div className="text-xs break-words bg-accent-100 border border-accent-400 text-accent-800 px-4 py-3 rounded-lg">
                  {truncateString(error, 50)}
                </div>
              )}

              {approvalHash && (
                <div
                  onClick={() => openExplorerUrl(approvalHash)}
                  className="flex flew-row items-center gap-1 mb-3 text-sm font-bold text-primary-500 hover:text-primary-300 hover:cursor-pointer"
                >
                  Approval TX in Explorer <ArrowRight className="w-4 h-4" />
                </div>
              )}

              {batchHash && (
                <div
                  onClick={() => openExplorerUrl(batchHash)}
                  className="flex flew-row items-center gap-1 mb-3 text-sm font-bold text-primary-500 hover:text-primary-300 hover:cursor-pointer"
                >
                  Stream TX in Explorer <ArrowRight className="w-4 h-4" />
                </div>
              )}

              {!isConnected && (
                <BaseButton onClick={handleConnect} type="button">
                  Connect Wallet
                </BaseButton>
              )}

              {isConnected && (
                <>
                  <BaseButton
                    type="submit"
                    disabled={
                      isLoading ||
                      isConfirming ||
                      isApprovalConfirming ||
                      isSuccess ||
                      isButtonDisabled
                    }
                  >
                    {getButtonText()}
                  </BaseButton>
                  {connectedDonor && (
                    <button
                      type="button"
                      className="w-full font-sm underline text-primary-500 hover:cursor-pointer text-center"
                      onClick={handleCancel}
                      disabled={
                        isLoading ||
                        isConfirming ||
                        isApprovalConfirming ||
                        isSuccess ||
                        isButtonDisabled
                      }
                    >
                      Cancel Stream
                    </button>
                  )}
                </>
              )}
            </>
          )}

          {isSuccess && Number(monthlyDonation) > 0 && (
            <>
              <div className="flex flex-col gap-1">
                <p className="text-primary-500 text-sm">
                  You&apos;ve joined the galaxy of Cracked Dev supporters!
                </p>
              </div>

              <p className="text-primary-500 text-sm">
                Cast about it to help grow the flow.
              </p>

              <BaseButton onClick={handleCast} type="button">
                Cast
              </BaseButton>
            </>
          )}

          {isSuccess && Number(monthlyDonation) <= 0 && (
            <>
              <div className="flex flex-col gap-1 mb-5">
                <p className="text-primary-500 text-sm">Stream cancelled</p>
              </div>
            </>
          )}
        </form>
      </div>
    </>
  );
}
