"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  FEATURED_NETWORK_ID,
  FEATURED_POOL_ID,
  FEATURED_POOLS,
} from "../lib/constants";

type PoolKey = keyof typeof FEATURED_POOLS;

interface PoolContextType {
  selectedPool: PoolKey;
  setSelectedPool: (pool: PoolKey) => void;
  getCurrentPoolData: () => (typeof FEATURED_POOLS)[PoolKey];
}

const PoolContext = createContext<PoolContextType | undefined>(undefined);

const defaultPoolKey = `${FEATURED_NETWORK_ID}-${FEATURED_POOL_ID}` as PoolKey;

export function PoolProvider({ children }: { children: ReactNode }) {
  const [selectedPool, setSelectedPool] = useState<PoolKey>(defaultPoolKey);

  const getCurrentPoolData = () => {
    return FEATURED_POOLS[selectedPool];
  };

  return (
    <PoolContext.Provider
      value={{
        selectedPool,
        setSelectedPool,
        getCurrentPoolData,
      }}
    >
      {children}
    </PoolContext.Provider>
  );
}

export function usePool() {
  const context = useContext(PoolContext);
  if (context === undefined) {
    throw new Error("usePool must be used within a PoolProvider");
  }
  return context;
}
