"use client";
import { useParams } from "next/navigation";
import PoolHQ from "./PoolHQ";

export default function Pool() {
  const { chainId, poolId } = useParams<{ chainId: string; poolId: string }>();

  return (
    <main className="relative">
      <PoolHQ chainId={chainId} poolId={poolId} />
    </main>
  );
}
