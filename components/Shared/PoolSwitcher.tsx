"use client";

import { usePool } from "../../contexts/pool-context";
import { FEATURED_POOLS } from "../../lib/constants";
import { ChangeEvent } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

export default function PoolSwitcher() {
  const { selectedPool, setPool } = usePool();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ chainId?: string; poolId?: string }>();

  const poolOptions = Object.keys(FEATURED_POOLS).map((poolKey) => {
    const poolData = FEATURED_POOLS[poolKey as keyof typeof FEATURED_POOLS];
    return {
      key: poolKey,
      label: poolData.CONTENT.NAME,
      value: poolKey,
    };
  });

  const handlePoolChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const poolData =
      FEATURED_POOLS[e.target.value as keyof typeof FEATURED_POOLS];
    setPool(`${poolData.DEFAULT_CHAIN_ID}-${poolData.DEFAULT_POOL_ID}`);

    // If we're on a pool route, navigate to the new pool route
    if (pathname?.startsWith("/pool/") && params?.chainId && params?.poolId) {
      // Extract any sub-route after the poolId (e.g., /leaderboard, /donation)
      const basePath = `/pool/${params.chainId}/${params.poolId}`;
      const subRoute = pathname.replace(basePath, "") || "";
      const newPath = `/pool/${poolData.DEFAULT_CHAIN_ID}/${poolData.DEFAULT_POOL_ID}${subRoute}`;
      router.push(newPath);
    }
  };

  return (
    <div className="relative w-72">
      <select
        id="pool-select"
        value={selectedPool}
        onChange={(e) => handlePoolChange(e)}
        className="appearance-none bg-white border border-black shadow-none focus:outline-none focus:ring-0 text-black font-bold text-lg rounded-full block w-full py-2 pr-10 pl-2 hover:cursor-pointer"
      >
        {poolOptions.map((option) => (
          <option key={option.key} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
    </div>
  );
}
