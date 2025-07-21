"use client";
import { usePoolData } from "@/hooks/use-pool-data";
import { useParams } from "next/navigation";
import LeaderboardList from "./LeaderboardList";
import LeaderActions from "./LeaderActions";
import { getTotalFlow } from "@/lib/pool";

export default function Leaderboard() {
  const { chainId, poolId } = useParams<{ chainId: string; poolId: string }>();
  const {
    data: poolData,
    isLoading,
    error,
  } = usePoolData({
    chainId: chainId,
    poolId: poolId,
  });

  if (isLoading || !poolData) {
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

  return (
    <main className="relative">
      <LeaderboardList poolData={poolData} />
      <LeaderActions
        chainId={chainId}
        poolId={poolId}
        totalFlow={getTotalFlow(poolData.poolDistributors).toString()}
      />
    </main>
  );
}
