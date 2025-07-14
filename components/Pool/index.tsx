"use client";
import PoolCircle from "@/components/Pool/PoolCircle";
import PoolActions from "@/components/Pool/PoolActions";
import { useUser } from "@/contexts/user-context";
import { usePoolData } from "@/hooks/use-pool-data";
import { useParams } from "next/navigation";

export default function Pool() {
  const { chainid, poolId } = useParams<{ chainid: string; poolId: string }>();
  const {
    data: poolData,
    isLoading,
    error,
  } = usePoolData({
    chainId: chainid,
    poolId: poolId,
  });
  const { user, signIn } = useUser();

  const handleOpenStream = () => {
    // This will be called from PoolActions component
    console.log("Opening stream from PoolActions");
  };
  const handleClaimSup = () => {
    // This will be called from PoolActions component
    console.log("Opening stream from PoolActions");
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-lg">Loading pool data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-lg text-red-500">
          Failed to load pool data: {error.message}
        </p>
      </div>
    );
  }

  if (!user.data) {
    <div className="w-full h-full flex flex-col items-center justify-center">
      <button onClick={signIn}>Sign In</button>
    </div>;
  }

  return (
    <main className="relative">
      <PoolCircle
        poolData={poolData}
        connectedUser={user.data}
        onOpenStream={handleOpenStream}
      />
      <PoolActions
        onOpenStream={handleOpenStream}
        onClaimSup={handleClaimSup}
        chainId={chainid}
        poolId={poolId}
      />
    </main>
  );
}
