"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useSwitchChain } from "wagmi";
import {
  FEATURED_NETWORK_ID,
  FEATURED_POOL_ID,
  FEATURED_POOLS,
} from "../lib/constants";
import { config } from "@/contexts/miniapp-wallet-context";

type PoolKey = keyof typeof FEATURED_POOLS;

interface PoolContextType {
  selectedPool: PoolKey;
  setPool: (pool: PoolKey) => void;
  getCurrentPoolData: () => (typeof FEATURED_POOLS)[PoolKey];
}

const PoolContext = createContext<PoolContextType | undefined>(undefined);

const defaultPoolKey = `${FEATURED_NETWORK_ID}-${FEATURED_POOL_ID}` as PoolKey;

export function PoolProvider({ children }: { children: ReactNode }) {
  const { switchChain } = useSwitchChain();
  const [selectedPool, setSelectedPool] = useState<PoolKey>(defaultPoolKey);

  const getCurrentPoolData = () => {
    return FEATURED_POOLS[selectedPool];
  };

  const setPool = async (pool: PoolKey) => {
    setSelectedPool(pool);

    const poolData = FEATURED_POOLS[pool as keyof typeof FEATURED_POOLS];
    console.log("switch chain", poolData.DEFAULT_CHAIN_ID);
    await switchChain({
      chainId: Number(poolData.DEFAULT_CHAIN_ID),
    });
    console.log("switch chain DONE");
  };

  useEffect(() => {
    setPool(defaultPoolKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PoolContext.Provider
      value={{
        selectedPool,
        setPool,
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
