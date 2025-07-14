"use client";
import PoolCircle from "@/components/Pool/PoolCircle";
import PoolActions from "@/components/Pool/PoolActions";
import { useUser } from "@/contexts/user-context";
import { usePoolData } from "@/hooks/use-pool-data";

const DEFAULT_CHAIN_ID = "11155420";
const DEFAULT_POOL_ID = "71";

export default function Home() {
  const {
    data: poolData,
    isLoading,
    error,
  } = usePoolData({
    chainId: DEFAULT_CHAIN_ID,
    poolId: DEFAULT_POOL_ID,
  });
  const { user, signIn } = useUser();

  console.log("poolData", poolData);

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
        chainId={DEFAULT_CHAIN_ID}
        poolId={DEFAULT_POOL_ID}
      />
    </main>
  );
}
