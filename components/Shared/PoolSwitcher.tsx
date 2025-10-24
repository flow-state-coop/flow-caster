"use client";

import { switchChain } from "@wagmi/core";
import { usePool } from "../../contexts/pool-context";
import { FEATURED_POOLS } from "../../lib/constants";
import { config } from "@/contexts/miniapp-wallet-context";
import { ChangeEvent } from "react";

export default function PoolSwitcher() {
  const { selectedPool, setSelectedPool } = usePool();

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
    setSelectedPool(`${poolData.DEFAULT_CHAIN_ID}-${poolData.DEFAULT_POOL_ID}`);
    await switchChain(config, {
      chainId: Number(poolData.DEFAULT_CHAIN_ID),
    });
  };

  return (
    <div className="w-48">
      <select
        id="pool-select"
        value={selectedPool}
        onChange={(e) => handlePoolChange(e)}
        className="bg-white border border-black focus:outline-none focus:ring-0 text-black text-xs rounded block w-full py-1 px-1 hover:cursor-pointer"
      >
        {poolOptions.map((option) => (
          <option key={option.key} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
