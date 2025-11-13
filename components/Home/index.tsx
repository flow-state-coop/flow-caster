"use client";

import { usePool } from "@/contexts/pool-context";
import PoolHQ from "../Shared/PoolHQ";

export default function Home() {
  const { getCurrentPoolData } = usePool();
  const poolData = getCurrentPoolData();

  return (
    <main className="relative">
      <PoolHQ
        chainId={poolData.DEFAULT_CHAIN_ID}
        poolId={poolData.DEFAULT_POOL_ID}
      />
    </main>
  );
}
