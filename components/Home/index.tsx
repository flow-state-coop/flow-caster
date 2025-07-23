"use client";

import PoolHQ from "../Pool/PoolHQ";

const DEFAULT_CHAIN_ID = "11155420";
const DEFAULT_POOL_ID = "71";

export default function Home() {
  return (
    <main className="relative">
      <PoolHQ chainId={DEFAULT_CHAIN_ID} poolId={DEFAULT_POOL_ID} />
    </main>
  );
}
