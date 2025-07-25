"use client";

import { usePoolData } from "@/hooks/use-pool-data";
import { DEV_POOL_ADDRESS, DEV_POOL_ID, TOKEN_DATA } from "@/lib/constants";
import { useState, useEffect } from "react";
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

import {
  Operation,
  OPERATION_TYPE,
  prepareOperation,
} from "@sfpro/sdk/constant";

import { superTokenAbi } from "@sfpro/sdk/abi";
import erc20Abi from "@/lib/abi/erc20.json";
import hostAbi from "@/lib/abi/sfHost.json";
import gdaAbi from "@/lib/abi/gdaV1.json";

import {
  calculateFlowratePerSecond,
  ratePerMonthFormatted,
  TIME_UNIT,
  truncateString,
} from "@/lib/pool";
import { encodeFunctionData, formatUnits, parseEther, parseUnits } from "viem";
import { networks } from "@/lib/flowapp/networks";
import { ArrowRight } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { PoolData } from "@/lib/types";

interface OpenStreamProps {
  chainId: string;
  poolId: string;
  poolAddress: string;
  connectedDonor?: PoolData["poolDistributors"][0];
}

export default function OpenStream({
  chainId,
  poolId,
  poolAddress,
  connectedDonor,
}: OpenStreamProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [monthlyDonation, setMonthlyDonation] = useState<string>("");
  const [wrapAmount, setWrapAmount] = useState<string>("");
  const [donateToDevs, setDonateToDevs] = useState<boolean>(false);
  const [currentMonthlyRate, setCurrentMonthlyRate] = useState<
    string | undefined
  >();
  const [currentDevDonor, setCurrentDevDonor] = useState(false);

  const { address, isConnected, chainId: connectedChainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { refetch } = usePoolData({
    chainId,
    poolId,
  });
  const { data: devPoolData } = usePoolData({
    chainId,
    poolId: DEV_POOL_ID,
  });

  const { connect, connectors } = useConnect();
  const { user } = useUser();

  const { writeContract: approve, data: approvalHash } = useWriteContract();
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } =
    useWaitForTransactionReceipt({
      hash: approvalHash,
    });

  // const { writeContract: batchCall, data: batchHash } = useWriteHost();
  const { writeContract: batchCall, data: batchHash } = useWriteContract();
  const { isLoading: isBatchConfirming, isSuccess: isBatchSuccess } =
    useWaitForTransactionReceipt({
      hash: batchHash,
    });

  const tokenData = TOKEN_DATA[chainId];
  // const [devDonationPercent, setDevDonationPercent] = useState<number>(5);
  const devDonationPercent = 5;

  // Fetch SuperToken balance
  const { data: superTokenBalance } = useReadSuperToken({
    address: tokenData.address,
    functionName: "balanceOf",
    args: [address || "0x0000000000000000000000000000000000000000"],
  });

  // Fetch underlying token balance
  const { data: underlyingBalance } = useReadContract({
    address: tokenData.underlyingAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address || "0x0000000000000000000000000000000000000000"],
  }) as { data: bigint | undefined };

  // Fetch underlying token allowance for SuperToken contract
  const { data: underlyingAllowance } = useReadContract({
    address: tokenData.underlyingAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: [
      address || "0x0000000000000000000000000000000000000000",
      tokenData.address,
    ],
  }) as { data: bigint | undefined };

  const userBalance = superTokenBalance
    ? Number(formatUnits(superTokenBalance, 18))
    : 0;

  const usdcBalance = underlyingBalance
    ? Number(formatUnits(underlyingBalance, tokenData.underlyingDecimals))
    : 0;

  // Validation logic
  const monthlyDonationAmount = parseFloat(monthlyDonation) || 0;
  const wrapAmountValue = parseFloat(wrapAmount) || 0;
  const totalSuperTokenBalance = userBalance + wrapAmountValue;
  const isMonthlyDonationEmpty =
    !currentMonthlyRate && monthlyDonationAmount === 0;
  const isInsufficientBalance =
    monthlyDonationAmount > 0 && totalSuperTokenBalance < monthlyDonationAmount;
  const isWrapAmountExceedsBalance = wrapAmountValue > usdcBalance;
  const isButtonDisabled =
    isMonthlyDonationEmpty ||
    isInsufficientBalance ||
    isWrapAmountExceedsBalance;

  useEffect(() => {
    if (!connectedDonor || !address || !devPoolData) return;

    const donor = devPoolData.poolDistributors.find((d) => {
      return d.account.id.toLowerCase() === address.toLowerCase();
    });

    setCurrentDevDonor(!!donor);
    setDonateToDevs(!!donor);

    const totalFlowRate = donor
      ? (BigInt(donor.flowRate) + BigInt(connectedDonor.flowRate)).toString()
      : connectedDonor.flowRate;

    const rate = ratePerMonthFormatted(totalFlowRate);
    setCurrentMonthlyRate(rate);
    setMonthlyDonation(rate);
  }, [connectedDonor, devPoolData, address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setError(null);

    if (Number(chainId) !== connectedChainId) {
      await switchChain({ chainId: Number(chainId) });
      return;
    }

    // const wrapAmountValue = parseFloat(wrapAmount) || 0;
    const wrapAmountValue = parseUnits(
      wrapAmount,
      tokenData.underlyingDecimals
    );

    const currentAllowance = Number(underlyingAllowance) || 0;

    // Step 1: Handle approval if needed
    if (wrapAmountValue > 0 && currentAllowance < wrapAmountValue) {
      setIsConfirming(true);
      approve(
        {
          address: tokenData.underlyingAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "approve",
          args: [tokenData.address, BigInt(wrapAmountValue)],
        },
        {
          onSuccess: () => {
            console.log("Approval transaction sent successfully");
            // The approval will be handled by the useWaitForTransactionReceipt hook
            setIsConfirming(false);
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
      proceedWithMainTransaction();
    }
  };

  // Function to handle the main transaction after approval
  const proceedWithMainTransaction = async () => {
    setIsSuccess(false);
    setIsLoading(false);
    setIsConfirming(true);

    const network = networks.find((network) => network.id === Number(chainId));

    if (!network || !address) {
      setError("Network or sender address not found");
      return;
    }

    let operations: Operation[] = [];

    const wrapAmountValue = parseUnits(
      wrapAmount,
      tokenData.underlyingDecimals
    );

    if (wrapAmountValue > 0) {
      operations = [
        prepareOperation({
          operationType: OPERATION_TYPE.SUPERTOKEN_UPGRADE,
          target: tokenData.address,
          data: encodeFunctionData({
            abi: superTokenAbi,
            functionName: "upgrade",
            args: [wrapAmountValue],
          }),
        }),
      ];
    }

    // handle 0 submission for existing stream
    const _monthlyDonation = monthlyDonation === "" ? "0" : monthlyDonation;
    let poolMonthlyDonation = parseFloat(_monthlyDonation);

    console.log("poolMonthlyDonation", poolMonthlyDonation);

    console.log("currentDevDonor", currentDevDonor);
    const zeroOutDevDonation =
      (poolMonthlyDonation == 0 && currentDevDonor) ||
      (currentDevDonor && !donateToDevs);

    console.log("zeroOutDevDonation", zeroOutDevDonation);

    if (donateToDevs || zeroOutDevDonation) {
      console.log("adding dev donation");
      const devMonthlyDonation = zeroOutDevDonation
        ? 0
        : parseFloat(_monthlyDonation) * (devDonationPercent / 100);
      poolMonthlyDonation = parseFloat(_monthlyDonation) - devMonthlyDonation;

      const devFlowRate = calculateFlowratePerSecond({
        amountWei: parseEther(devMonthlyDonation.toString()),
        timeUnit: TIME_UNIT["month"],
      });

      console.log("devFlowRate", devFlowRate);

      operations = [
        ...operations,
        prepareOperation({
          operationType: OPERATION_TYPE.SUPERFLUID_CALL_AGREEMENT,
          target: network.gdaV1,
          data: encodeFunctionData({
            abi: gdaAbi,
            functionName: "distributeFlow",
            args: [
              tokenData.address,
              address,
              DEV_POOL_ADDRESS as `0x${string}`,
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
            tokenData.address,
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
      proceedWithMainTransaction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApprovalSuccess, isApprovalConfirming]);

  // Monitor batch transaction completion
  useEffect(() => {
    if (isBatchSuccess && isBatchConfirming === false) {
      console.log(
        "Batch transaction confirmed, proceeding with main transaction"
      );
      refetch();
      setIsSuccess(true);

      const options = {
        method: "POST",
        body: JSON.stringify({
          poolid: poolId,
          chainid: chainId,
          poolname: "Farcaster Cracked Devs",
          username: user?.data?.username || "A myster donor",
          flowrate: monthlyDonation,
        }),
      };
      fetch(`/api/notify-donation`, options);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBatchSuccess, isBatchConfirming]);

  const openExplorerUrl = (hash: string) => {
    sdk.actions.openUrl(`https://basescan.org/tx/${hash}`);
  };

  const handleCast = async () => {
    await sdk.actions.composeCast({
      text: `Forget weekly tips. I'm supporting 78 Cracked Farcaster Devs with a real-time token stream on @flowstatecoop. \n\n Instant + Consistent Funding = More Builders Building`,
      embeds: [
        `${process.env.NEXT_PUBLIC_URL}/pool/${chainId}/${poolId}/donation?fid=${user?.data?.fid}&flowRate=${monthlyDonationAmount}`,
      ],
    });
  };

  const getButtonText = () => {
    if (isLoading) return "Preparing...";
    if (isConfirming || isApprovalConfirming) return "Confirming...";
    if (isSuccess) return "Success!";
    if (isMonthlyDonationEmpty) return "Add streaming amount";
    if (isWrapAmountExceedsBalance)
      return `${tokenData.underlyingSymbol} balance too low`;
    if (isInsufficientBalance)
      return `${tokenData.symbol} balance too low. Wrap ${tokenData.underlyingSymbol}`;
    return "Open Stream";
  };

  const getButtonClass = () => {
    const baseClass =
      "w-full px-4 py-3 rounded-lg text-black border-2 border-black font-medium text-xl transition-colors";

    if (
      isLoading ||
      isConfirming ||
      isApprovalConfirming ||
      isSuccess ||
      isButtonDisabled
    ) {
      return `${baseClass} bg-gray-400 text-gray-700 cursor-not-allowed`;
    }

    return `${baseClass} bg-accent-800 hover:bg-accent-600`;
  };

  return (
    <div className="max-w-md mx-auto">
      {currentMonthlyRate && !isSuccess && (
        <div className="mb-4 text-primary-800">
          <div className="font-bold text-base leading-none">
            Currently streaming ~ {currentMonthlyRate} USDCx / mo
          </div>
          <span className="text-xs font-normal text-primary-700">
            {" "}
            *set to 0 to close your stream.
          </span>
        </div>
      )}
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
                    {tokenData.symbol}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-primary-700">
                Streaming token ({tokenData.symbol}) balance:{" "}
                {userBalance.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* Wrap for USDCx */}
            <div>
              <label
                htmlFor="wrapAmount"
                className="block text-sm font-medium text-primary-800 mb-2"
              >
                How much {tokenData.underlyingSymbol} should we wrap to support
                your stream?
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
                    {tokenData.underlyingSymbol}{" "}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-primary-700">
                {tokenData.underlyingSymbol} balance:{" "}
                {usdcBalance.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              </p>
              <div className="border border-primary-400 bg-primary-100 rounded-lg px-2 py-2 mt-2 text-xs">
                <p className="text-primary-800 font-bold">
                  Your stream will last until your {tokenData.symbol} balance is
                  depleted. You can wrap/unwrap more at any time to
                  extend/shorten.{" "}
                </p>
                <p className="mt-1 text-primary-800 font-normal">
                  {(() => {
                    const currentBalance = userBalance;
                    const wrapAmountValue = parseFloat(wrapAmount) || 0;
                    const monthlyAmount = parseFloat(monthlyDonation) || 0;
                    const totalBalance = currentBalance + wrapAmountValue;

                    if (monthlyAmount > 0 && totalBalance > 0) {
                      const monthsSupported = totalBalance / monthlyAmount;
                      if (monthsSupported >= 1) {
                        return `${totalBalance.toLocaleString("en-US", {
                          maximumFractionDigits: 2,
                        })} ${
                          tokenData.symbol
                        } will support your stream for ~ ${monthsSupported.toLocaleString(
                          "en-US",
                          {
                            maximumFractionDigits: 2,
                          }
                        )} months.`;
                      } else {
                        const daysSupported = Math.floor(monthsSupported * 30);
                        return `This much ${tokenData.symbol} will support your stream for ${daysSupported} days.`;
                      }
                    } else if (monthlyAmount === 0) {
                      return "Enter a monthly amount to see how long your balance will last.";
                    } else {
                      return "Wrap some tokens to support your stream.";
                    }
                  })()}
                </p>
              </div>
              {(() => {
                const currentAllowance = Number(underlyingAllowance) || 0;
                // const wrapAmountValue = parseFloat(wrapAmount) || 0;
                const wrapAmountValue = parseUnits(
                  wrapAmount,
                  tokenData.underlyingDecimals
                );

                if (wrapAmountValue > 0 && currentAllowance < wrapAmountValue) {
                  return (
                    <div className="border border-accent-400 bg-accent-100 rounded-lg px-2 py-2 mt-2 text-xs">
                      <p className="text-xs text-accent-800">
                        There will be an approval request allowing wrapping of{" "}
                        {tokenData.underlyingSymbol}
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
                  className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-accent-300 rounded accent-accent-600 checked:bg-accent-600 checked:border-accent-600"
                />
                <label
                  htmlFor="donateToDevs"
                  className="ml-2 block text-sm font-medium text-primary-800"
                >
                  Donate 5% to flowcaster devs
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
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className="w-full px-4 py-3 text-black rounded-lg border-2 border-black font-medium text-xl transition-colors"
              >
                Connect Wallet
              </button>
            )}

            {isConnected && (
              <button
                type="submit"
                className={getButtonClass()}
                disabled={
                  isLoading ||
                  isConfirming ||
                  isApprovalConfirming ||
                  isSuccess ||
                  isButtonDisabled
                }
              >
                {getButtonText()}
              </button>
            )}
          </>
        )}
        {isSuccess && (
          <>
            <p className="text-accent-800 text-3xl font-bold">Success! 🫡</p>
            <div className="flex flex-col gap-1">
              <p className="text-primary-500 text-sm mb-0">
                You&apos;ve joined the galaxy of cracked dev supporters and have
                started earning SUP rewards.
              </p>

              <p className="text-primary-400 text-xs">
                If flow data does not update immediately it is likely due to
                slow indexing and should show up soon.
              </p>
            </div>

            <p className="text-primary-500 text-sm font-bold">
              Cast about it to help grow the flow.
            </p>

            <button
              onClick={handleCast}
              type="button"
              className="w-full px-4 py-3 rounded-lg text-black border-2 border-black font-medium text-xl transition-colors bg-accent-800 hover:bg-accent-600"
            >
              Cast
            </button>
          </>
        )}
      </form>
    </div>
  );
}
