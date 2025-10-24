"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useUser } from "@/contexts/user-context";
import { PoolUserProvider } from "@/contexts/pool-user-context";
import { usePoolData } from "@/hooks/use-pool-data";
import { getTotalFlow } from "@/lib/pool";
import { usePool } from "@/contexts/pool-context";
import LeaderboardList from "./LeaderboardList";
import Footer from "../Shared/Footer";
import Spinner from "../Shared/Spinner";

export default function Leaderboard() {
  const { chainId, poolId } = useParams<{ chainId: string; poolId: string }>();
  const [devPoolList, setDevPoolList] = useState<
    Record<string, string> | undefined
  >();
  const { getCurrentPoolData } = usePool();
  const currentPoolData = getCurrentPoolData();
  
  const {
    data: poolData,
    poolDistributors,
    poolMembers,
    isLoading,
    error,
  } = usePoolData({
    chainId: chainId,
    poolId: poolId,
  });
  const { poolDistributors: devPoolDistributors } = usePoolData({
    chainId,
    poolId: currentPoolData.DEV_POOL_ID,
  });
  const { user } = useUser();
  const { address } = useAccount();

  useEffect(() => {
    if (!devPoolDistributors) return;

    const rateList = devPoolDistributors.reduce((acc, d) => {
      acc[d.account.id] = d.flowRate;
      return acc;
    }, {} as Record<string, string>);

    setDevPoolList(rateList);
  }, [devPoolDistributors]);

  if (isLoading || !poolData || !poolDistributors) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-lg text-accent-800">
          Failed to load pool. {error.message}
        </p>
      </div>
    );
  }

  return (
    <main className="relative">
      <PoolUserProvider
        poolDistributors={poolDistributors}
        poolMembers={poolMembers}
        user={user?.data}
        connectedAddress={address}
      >
        <LeaderboardList poolData={poolData} devPoolList={devPoolList} />
        <Footer
          chainId={chainId}
          poolId={poolId}
          poolAddress={poolData.id}
          totalFlow={getTotalFlow(poolData.poolDistributors).toString()}
        />
      </PoolUserProvider>
    </main>
  );
}
