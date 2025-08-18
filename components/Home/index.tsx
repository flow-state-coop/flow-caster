"use client";

import { FEATURED_POOL_DATA } from "@/lib/constants";
import PoolHQ from "../Shared/PoolHQ";

export default function Home() {
  return (
    <main className="relative">
      <PoolHQ
        chainId={FEATURED_POOL_DATA.DEFAULT_CHAIN_ID}
        poolId={FEATURED_POOL_DATA.DEFAULT_POOL_ID}
      />
    </main>
  );
}
