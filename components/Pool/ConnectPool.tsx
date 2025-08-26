"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useAccount,
  useConnect,
} from "wagmi";
import sdk from "@farcaster/miniapp-sdk";
import { ArrowRight, CircleCheck, LoaderCircle, X } from "lucide-react";
import { usePoolData } from "@/hooks/use-pool-data";
import { gdaForwarderAbi } from "@/lib/abi/gdaForwarder";
import { networks } from "@/lib/flowapp/networks";
import { PoolData } from "@/lib/types";
import BaseButton from "../Shared/BaseButton";

interface ConnectPoolProps {
  poolAddress: string;
  chainId: string;
  poolId: string;
  connectedAddressNotPoolAddress: boolean;
  connectedMember: PoolData["poolMembers"][0];
  handleCloseDrawer: () => void;
  noUnits?: boolean;
  shouldConnect?: boolean;
}

export default function ConnectPool({
  poolAddress,
  chainId,
  poolId,
  connectedAddressNotPoolAddress,
  connectedMember,
  handleCloseDrawer,
  noUnits,
  shouldConnect,
}: ConnectPoolProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isConfirmingAdd, setIsConfirmingAdd] = useState(false);
  const [shareComplete, setShareComplete] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const { address, isConnected, chainId: connectedChainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: poolData, refetch } = usePoolData({
    chainId,
    poolId,
  });
  const { connect, connectors } = useConnect();

  const { writeContract, data: hash } = useWriteContract();

  const { isLoading: isConfirmingTx, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  const onConnectPool = async () => {
    const network = networks.find((network) => network.id === Number(chainId));

    if (!network?.gdaForwarder) {
      setError("Network or GDA forwarder not found");
      return;
    }

    if (Number(chainId) !== connectedChainId) {
      console.log("*** SWITCH CHAIN");
      console.log("chainId", connectedChainId);
      console.log("connectedChainId", connectedChainId);
      await switchChain({ chainId: Number(chainId) });
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    writeContract(
      {
        address: network.gdaForwarder,
        abi: gdaForwarderAbi,
        functionName: "connectPool",
        args: [poolAddress as `0x${string}`, "0x"],
      },
      {
        onSuccess: () => {
          setIsLoading(false);
          setIsConfirming(true);
        },
        onError: (error) => {
          setIsLoading(false);
          setIsConfirming(false);
          console.log("tx error", error);
          setError(error.message || "Transaction failed");
        },
      }
    );
  };

  useEffect(() => {
    if (isTxSuccess) {
      refetch();
    }
  }, [isTxSuccess, refetch]);

  // Handle transaction confirmation status
  if (isConfirmingTx && !isConfirming) {
    setIsConfirming(true);
  }

  if (isTxSuccess && isConfirming) {
    setIsConfirming(false);
    setIsSuccess(true);
  }

  const openExplorerUrl = useCallback(() => {
    sdk.actions.openUrl(`https://basescan.org/tx/${hash}`);
  }, [hash]);

  const handleShare = async () => {
    console.log("sharing");
    setIsConfirmingAdd(true);
    setShareError(null);
    setIsAddingMember(false);

    try {
      const targetUrl = `${process.env.NEXT_PUBLIC_URL}`;

      await sdk.actions.composeCast({
        text: `I'm claiming my spot in the Cracked Farcaster Devs funding pool. Open a continuous tip stream to us, so we can stay focused on building cool stuff.`,
        embeds: [targetUrl],
      });

      // After successful share, add member to Flow Caster
      setIsAddingMember(true);

      const response = await fetch(
        `/api/add-member?member=${connectedMember.account.id}&chainId=${chainId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to add member: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Member added successfully:", data);

      // on success
      // refetch();
      setIsConfirmingAdd(false);
      setIsAddingMember(false);
      setShareComplete(true);
    } catch (error) {
      console.error("Error in handleShare:", error);
      setShareError(
        error instanceof Error
          ? error.message
          : "Failed to share and add member"
      );
      setIsConfirmingAdd(false);
      setIsAddingMember(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Preparing...";
    if (isConfirming) return "Confirming...";
    if (isSuccess) return "Success!";
    return "Connect to Pool";
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-accent-800">
          We want to pay you!
        </h2>
        <button
          onClick={handleCloseDrawer}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-2 text-primary-800">
        {noUnits ? (
          <div>
            Opt-in to the Cracked Farcaster Devs by sharing the app & then
            connecting your real-time token stream.
          </div>
        ) : (
          <div>
            Cracked dev rewards are already flowing. Complete a one-time
            transaction to receive your token stream split in real-time.
          </div>
        )}
      </div>
      <div className="mb-6">
        {shareComplete && (
          <p className="text-primary-500 text-xl font-bold">
            You&apos;re Connected!
          </p>
        )}
      </div>
      <div className="mb-6">
        {isSuccess && !shouldConnect && (
          <p className="text-primary-500 text-xl font-bold">
            You&apos;re Connected!
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-accent-200 border border-accent-900 text-xs text-accent-900 rounded break-words">
          {error}
        </div>
      )}

      {shareError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-500 text-xs text-red-700 rounded break-words">
          {shareError}
        </div>
      )}

      {isSuccess && (
        <div className="mb-4 p-3 text-lg font-bold text-primary-500 bg-primary-100 border border-primary-500 rounded break-words">
          Successfully connected to pool! {poolData?.token.symbol} is streaming
          to your wallet.
        </div>
      )}

      {hash && (
        <div
          onClick={openExplorerUrl}
          className="flex flew-row items-center gap-1 mb-3 text-sm font-bold text-primary-500 hover:text-primary-300 hover:cursor-pointer"
        >
          Open TX in Explorer <ArrowRight className="w-4 h-4" />
        </div>
      )}

      {connectedAddressNotPoolAddress && (
        <div className="flex flex-col gap-2 mb-4 p-3 bg-accent-200 border border-accent-900 text-xs text-accent-900 rounded break-words">
          <div>
            Switch to your Farcaster wallet in the mini app menu to connect.
          </div>
          <div>Connected Wallet: {address?.toLowerCase()}</div>
          <div>
            Recipient Wallet: {connectedMember.account.id.toLowerCase()}
          </div>
        </div>
      )}

      {!isConnected && (
        <BaseButton onClick={() => connect({ connector: connectors[0] })}>
          Connect Wallet
        </BaseButton>
      )}

      {noUnits ? (
        <>
          {isConnected && !connectedAddressNotPoolAddress && (
            <div className="flex flex-row gap-5">
              <BaseButton
                className="w-1/2"
                onClick={handleShare}
                disabled={shareComplete || isConfirmingAdd || isAddingMember}
              >
                <div className="flex flex-row gap-2 items-center justify-center">
                  {shareComplete && (
                    <CircleCheck className="w-4 h-4 fill-primary-500" />
                  )}
                  {(isConfirmingAdd || isAddingMember) && (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  )}
                  {isConfirmingAdd
                    ? "Sharing..."
                    : isAddingMember
                    ? "Adding Member..."
                    : "Share"}
                </div>
              </BaseButton>
              {shouldConnect && (
                <BaseButton
                  className="w-1/2"
                  onClick={onConnectPool}
                  disabled={isLoading || isConfirming || isSuccess}
                >
                  {getButtonText()}
                </BaseButton>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {isConnected && !connectedAddressNotPoolAddress && (
            <BaseButton
              onClick={onConnectPool}
              disabled={isLoading || isConfirming || isSuccess}
            >
              {getButtonText()}
            </BaseButton>
          )}
        </>
      )}
    </>
  );
}
