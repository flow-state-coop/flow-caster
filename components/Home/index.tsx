"use client";
import PoolCircle from "@/components/Pool/PoolCircle";
import { useMiniApp } from "@/contexts/miniapp-context";
import { useUser } from "@/contexts/user-context";
import { usePoolData } from "@/hooks/use-pool-data";
import { useEffect, useState } from "react";

import tmpUserJson from "../../lib/data/tempUser.json";
import { NeynarUser } from "@/lib/neynar";

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
  const { user, signIn } = useUser();

  console.log("user", user);

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
    <main>
      <PoolCircle poolData={poolData} connectedUser={user.data} />
    </main>
  );
}
