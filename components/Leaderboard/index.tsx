"use client";
import { usePoolData } from "@/hooks/use-pool-data";
import { useParams } from "next/navigation";
import LeaderboardList from "./LeaderboardList";
import LeaderActions from "./LeaderActions";

export default function Leaderboard() {
  const { chainid, poolId } = useParams<{ chainid: string; poolId: string }>();
  const {
    data: poolData,
    isLoading,
    error,
  } = usePoolData({
    chainId: chainid,
    poolId: poolId,
  });

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

  return (
    <main className="relative">
      <LeaderboardList poolData={poolData} />
      <LeaderActions chainId={chainid} poolId={poolId} />
    </main>
  );
}
