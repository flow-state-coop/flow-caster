"use client";

import { useState, useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import { formatUnits, parseEther, parseUnits } from "viem";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useAccount,
  useConnect,
} from "wagmi";
import { useReadSuperToken } from "@sfpro/sdk/hook";
import { FEATURED_POOL_DATA, TOKEN_DATA, ZERO_ADDRESS } from "@/lib/constants";
import erc20Abi from "@/lib/abi/erc20.json";
import { superTokenAbi } from "@sfpro/sdk/abi";
import { openExplorerUrl } from "@/lib/helpers";
import BaseButton from "../Shared/BaseButton";
import { truncateString } from "@/lib/pool";

interface ManageSupertokenProps {
  address: `0x${string}`;
}

export default function ManageSupertoken({ address }: ManageSupertokenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isWrapping, setIsWrapping] = useState(true); // true = wrap, false = unwrap
  const [amount, setAmount] = useState<string>("");
  const { switchChain } = useSwitchChain();
  const { isConnected, chainId: connectedChainId } = useAccount();
  const { connect, connectors } = useConnect();

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
    writeContract: executeTx,
    data: txHash,
    reset: resetTx,
  } = useWriteContract();
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const tokenData = TOKEN_DATA[FEATURED_POOL_DATA.DEFAULT_CHAIN_ID];

  // Fetch SuperToken balance
  const { data: superTokenBalance, refetch: refetchSuperTokenBal } =
    useReadSuperToken({
      address: tokenData.address,
      functionName: "balanceOf",
      args: [address || ZERO_ADDRESS],
    });

  // Fetch underlying token balance
  const { data: underlyingBalance } = useReadContract({
    address: tokenData.underlyingAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address || ZERO_ADDRESS],
  }) as { data: bigint | undefined };

  // Fetch underlying token allowance for SuperToken contract
  const { data: underlyingAllowance } = useReadContract({
    address: tokenData.underlyingAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address || ZERO_ADDRESS, tokenData.address],
  }) as { data: bigint | undefined };

  const userSuperTokenBalance = superTokenBalance
    ? Number(formatUnits(superTokenBalance, 18))
    : 0;
  const userUnderlyingBalance = underlyingBalance
    ? Number(formatUnits(underlyingBalance, tokenData.underlyingDecimals))
    : 0;

  // Validation logic
  const amountValue = parseFloat(amount) || 0;
  const isAmountEmpty = amountValue === 0;
  const isInsufficientBalance = isWrapping
    ? amountValue > userUnderlyingBalance
    : amountValue > userSuperTokenBalance;
  const isButtonDisabled = isAmountEmpty || isInsufficientBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (connectedChainId !== Number(FEATURED_POOL_DATA.DEFAULT_CHAIN_ID)) {
      await switchChain({
        chainId: Number(FEATURED_POOL_DATA.DEFAULT_CHAIN_ID),
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    const amountValue = parseFloat(amount) || 0;
    if (amountValue === 0) {
      setError("Please enter an amount");
      setIsLoading(false);
      return;
    }

    if (isWrapping) {
      // Handle wrapping (upgrading)
      // const wrapAmount = parseUnits(amount, tokenData.underlyingDecimals);
      const wrapAmount = parseEther(amount);
      const currentAllowance = Number(underlyingAllowance) || 0;

      // Check if approval is needed
      if (currentAllowance < wrapAmount) {
        setIsConfirming(true);
        approve(
          {
            address: tokenData.underlyingAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [tokenData.address, wrapAmount],
          },
          {
            onSuccess: () => {
              console.log("Approval transaction sent successfully");
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
        // No approval needed, proceed with upgrade
        proceedWithUpgrade();
      }
    } else {
      // Handle unwrapping (downgrading)
      proceedWithDowngrade();
    }
  };

  const proceedWithUpgrade = () => {
    setIsConfirming(true);
    const wrapAmount = parseUnits(amount, tokenData.underlyingDecimals);

    executeTx(
      {
        abi: superTokenAbi,
        address: tokenData.address,
        functionName: "upgrade",
        args: [wrapAmount],
      },
      {
        onSuccess: () => {
          console.log("Upgrade transaction sent successfully");
        },
        onError: (error) => {
          console.error("Upgrade failed:", error);
          setError(`Upgrade failed: ${error.message}`);
          setIsLoading(false);
          setIsConfirming(false);
        },
      }
    );
  };

  const proceedWithDowngrade = () => {
    setIsConfirming(true);
    const unwrapAmount = parseUnits(amount, 18); // SuperTokens use 18 decimals

    executeTx(
      {
        abi: superTokenAbi,
        address: tokenData.address,
        functionName: "downgrade",
        args: [unwrapAmount],
      },
      {
        onSuccess: () => {
          console.log("Downgrade transaction sent successfully");
        },
        onError: (error) => {
          console.error("Downgrade failed:", error);
          setError(`Downgrade failed: ${error.message}`);
          setIsLoading(false);
          setIsConfirming(false);
        },
      }
    );
  };

  // Monitor approval transaction completion
  useEffect(() => {
    if (isApprovalSuccess && isApprovalConfirming === false) {
      console.log("Approval transaction confirmed, proceeding with upgrade");
      setIsConfirming(false);
      proceedWithUpgrade();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApprovalSuccess, isApprovalConfirming]);

  // Monitor main transaction completion
  useEffect(() => {
    if (isTxSuccess && isTxConfirming === false) {
      setTimeout(() => {
        setIsConfirming(false);
        setIsSuccess(true);
        setAmount("");
        refetchSuperTokenBal();
        resetForm();
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxSuccess, isTxConfirming]);

  const resetForm = () => {
    setIsLoading(false);
    setIsConfirming(false);
    setError(null);
    setIsSuccess(false);
    setAmount("");
    resetApproval();
    resetTx();
  };

  const getButtonText = () => {
    if (isLoading) return "Preparing...";
    if (isConfirming || isApprovalConfirming || isTxConfirming)
      return "Confirming...";
    if (isSuccess) return "Success!";
    if (isAmountEmpty) return `Enter ${isWrapping ? "wrap" : "unwrap"} amount`;
    if (isInsufficientBalance) {
      const symbol = isWrapping ? tokenData.underlyingSymbol : tokenData.symbol;
      return `${symbol} balance too low`;
    }
    return isWrapping ? "Wrap Tokens" : "Unwrap Tokens";
  };

  const getBalanceSymbol = (toggle?: boolean) => {
    if (toggle)
      return isWrapping ? tokenData.symbol : tokenData.underlyingSymbol;
    return isWrapping ? tokenData.underlyingSymbol : tokenData.symbol;
  };

  return (
    <div className="text-black max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Toggle between wrap/unwrap */}
        <div className="flex bg-primary-200 rounded-lg p-1">
          <button
            type="button"
            onClick={() => {
              setIsWrapping(true);
              setAmount("");
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isWrapping
                ? "bg-white text-primary-800 shadow-sm"
                : "text-primary-600 hover:text-primary-800"
            }`}
          >
            <div className="flex flex-col">
              <div className="font-bold text-lg">Wrap</div>
              <div className="flex flex-row gap-1 w-full items-center justify-center">
                ({tokenData.underlyingSymbol} <ArrowRight className="w-3 h-3" />{" "}
                {tokenData.symbol})
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsWrapping(false);
              setAmount("");
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              !isWrapping
                ? "bg-white text-primary-800 shadow-sm"
                : "text-primary-600 hover:text-primary-800"
            }`}
          >
            <div className="flex flex-col">
              <div className="font-bold text-lg">Unwrap</div>
              <div className="flex flex-row gap-1 w-full items-center justify-center">
                ({tokenData.symbol} <ArrowRight className="w-3 h-3" />{" "}
                {tokenData.underlyingSymbol})
              </div>
            </div>
          </button>
        </div>

        <div className="flex flex-row justify-between flex-wrap text-xs text-primary-800">
          <p className="mt-2 font-bold">
            {tokenData.underlyingSymbol} balance:{" "}
            {userUnderlyingBalance?.toLocaleString("en-US", {
              maximumFractionDigits: 4,
            })}
          </p>
          <p className="mt-2 font-bold">
            {tokenData.symbol} balance:{" "}
            {userSuperTokenBalance.toLocaleString("en-US", {
              maximumFractionDigits: 4,
            })}
          </p>
        </div>

        {/* Amount input */}
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-primary-800 mb-2"
          >
            Amount to {isWrapping ? "wrap" : "unwrap"}
          </label>
          <div className="relative">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              placeholder="0.00"
              className="w-full text-black px-4 py-3 pr-20 rounded-lg border border-primary-300 focus:ring-2 focus:ring-secondary-800 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 text-sm font-medium">
                {getBalanceSymbol()}
              </span>
            </div>
          </div>
        </div>

        {/* Approval notice for wrapping */}
        {isWrapping &&
          amountValue > 0 &&
          (() => {
            const currentAllowance = Number(underlyingAllowance) || 0;
            const wrapAmount = parseUnits(amount, tokenData.underlyingDecimals);

            if (currentAllowance < wrapAmount) {
              return (
                <div className="border border-accent-400 bg-accent-100 rounded-lg px-3 py-3 text-xs">
                  <p className="text-accent-800">
                    There will be an approval request allowing wrapping of{" "}
                    {tokenData.underlyingSymbol}
                  </p>
                </div>
              );
            }
            return null;
          })()}

        {error && (
          <div className="text-xs break-words bg-accent-100 border border-accent-400 text-accent-800 px-4 py-3 rounded-lg">
            {truncateString(error, 50)}
          </div>
        )}
        <div>
          {/* Transaction hashes */}
          {approvalHash && (
            <div
              onClick={() => openExplorerUrl(approvalHash)}
              className="flex flew-row items-center gap-1 mb-1 text-xs font-bold text-primary-500 hover:text-primary-300 hover:cursor-pointer"
            >
              Approval TX in Explorer <ArrowRight className="w-4 h-4" />
            </div>
          )}

          {txHash && (
            <div
              onClick={() => openExplorerUrl(txHash)}
              className="flex flew-row items-center gap-1 text-xs font-bold text-primary-500 hover:text-primary-300 hover:cursor-pointer"
            >
              {isWrapping ? "Wrap" : "Unwrap"} TX in Explorer{" "}
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </div>

        {!isConnected && (
          <BaseButton
            type="button"
            onClick={() => connect({ connector: connectors[0] })}
          >
            Connect Wallet
          </BaseButton>
        )}

        {isConnected && (
          <BaseButton
            type="submit"
            disabled={
              isLoading ||
              isConfirming ||
              isApprovalConfirming ||
              isTxConfirming ||
              isSuccess ||
              isButtonDisabled
            }
          >
            {getButtonText()}
          </BaseButton>
        )}
      </form>

      {isSuccess && (
        <div className="mt-5">
          <div className="flex flex-col gap-1">
            <p className="text-accent-500 text-xl font-bold w-full text-center">
              {isWrapping
                ? `Successfully wrapped ${amount} ${tokenData.underlyingSymbol} to ${tokenData.symbol}!`
                : `Successfully unwrapped ${amount} ${tokenData.symbol} to ${tokenData.underlyingSymbol}!`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
