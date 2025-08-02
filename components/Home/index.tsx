"use client";

import { DEFAULT_CHAIN_ID, DEFAULT_POOL_ID } from "@/lib/constants";
import PoolHQ from "../Pool/PoolHQ";

export default function Home() {
  return (
    <main className="relative">
      <PoolHQ chainId={DEFAULT_CHAIN_ID} poolId={DEFAULT_POOL_ID} />
    </main>
  );
}
