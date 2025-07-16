import { gdaForwarderAbi } from "@/lib/abi/gdaForwarder";
import { networks } from "@/lib/flowapp/networks";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi";
import { useCallback, useEffect, useState } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { usePoolData } from "@/hooks/use-pool-data";
import { PoolData } from "@/lib/types";

export default function ConnectPool({
  poolAddress,
  chainId,
  poolId,
  connectedAddressNotPoolAddress,
  connectedMember,
}: {
  poolAddress: string;
  chainId: string;
  poolId: string;
  connectedAddressNotPoolAddress: boolean;
  connectedMember: PoolData["poolMembers"][0];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { address, isConnected, chainId: connectedChainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { refetch } = usePoolData({
    chainId,
    poolId,
  });
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const { writeContract, data: hash } = useWriteContract();

  const { isLoading: isConfirmingTx, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  const onConnectPool = async () => {
    console.log("onConnectPool");
    const network = networks.find((network) => network.id === Number(chainId));

    if (!network?.gdaForwarder) {
      setError("Network or GDA forwarder not found");
      return;
    }

    console.log("connectedChainId", connectedChainId);
    console.log("chainId", chainId);
    console.log("isConnected", isConnected);

    if (Number(chainId) !== connectedChainId) {
      await switchChain({ chainId: Number(chainId) });
      return;
    }

    console.log("connectedChainId after", connectedChainId);

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

  const openExporerUrl = useCallback(() => {
    sdk.actions.openUrl(`https://basescan.org/tx/${hash}`);
  }, [hash]);

  const getButtonText = () => {
    if (isLoading) return "Preparing...";
    if (isConfirming) return "Confirming...";
    if (isSuccess) return "Success!";
    return "Start Recieiving";
  };

  const getButtonClass = () => {
    const baseClass =
      "w-full px-4 py-3 rounded-lg border-2 border-black font-medium text-xl transition-colors";

    if (isLoading || isConfirming || isSuccess) {
      return `${baseClass} bg-gray-400 text-white cursor-not-allowed`;
    }

    return `${baseClass} bg-accent-800 text-white hover:bg-accent-600`;
  };

  return (
    <>
      <div className="mb-6">
        {!isSuccess && (
          <p className="text-black">
            You&apos;re a recipient in this pool but haven&apos;t connected your
            shares. Run the connection transacation to start receiving tokens.
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-accent-200 border border-accent-900 text-xs text-accent-900 rounded break-words">
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="mb-4 p-3 text-lg font-bold text-primary-500 bg-primary-100 border border-primary-500 rounded break-words">
          Successfully connected to pool! USDCx is streaming to your wallet.
        </div>
      )}

      {hash && (
        <div
          onClick={openExporerUrl}
          className="mb-3 text-sm font-bold text-primary-500 hover:text-primary-300 hover:cursor-pointer"
        >
          Open TX in Explorer →
        </div>
      )}

      {connectedAddressNotPoolAddress && (
        <div className="flex flex-col gap-2 mb-4 p-3 bg-accent-200 border border-accent-900 text-xs text-accent-900 rounded break-words">
          <div>
            Your connected wallet is not the recieving wallet for this pool.
          </div>
          <div>Connected Wallet: {address}</div>
          <div>Recipient Wallet: {connectedMember.account.id}</div>
          <div className="font-bold">
            If connected outside the Farcaster Wallet you&apos;ll need to
            disconnect in that wallet and reconnect here.
          </div>
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

      {isConnected && !connectedAddressNotPoolAddress && (
        <button
          className={getButtonClass()}
          onClick={onConnectPool}
          disabled={isLoading || isConfirming || isSuccess}
        >
          {getButtonText()}
        </button>
      )}
    </>
  );
}
