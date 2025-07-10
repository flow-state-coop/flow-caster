"use client";
import PoolCircle from "@/components/Pool/PoolCircle";
import { useUser } from "@/contexts/user-context";
import { usePoolData } from "@/hooks/use-pool-data";

const DEFAULT_CHAIN_ID = "11155420";
const DEFAULT_POOL_ID = "0xa7a13049bdf22c499e33e743c2031b66eb03772a";

export default function Home() {
  const {
    data: poolData,
    isLoading,
    error,
  } = usePoolData({
    chainId: DEFAULT_CHAIN_ID,
    poolId: DEFAULT_POOL_ID,
  });
  const { user } = useUser();

  console.log("user", user);

  return (
    <main>
      <PoolCircle
        poolData={poolData}
        connectedUser={user?.data}
        isLoading={isLoading}
        error={error}
      />
    </main>
  );
}
