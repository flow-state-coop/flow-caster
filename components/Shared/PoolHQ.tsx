"use client";

import { useAccount } from "wagmi";
import { useUser } from "@/contexts/user-context";
import { usePool } from "@/contexts/pool-context";
import { PoolUserProvider } from "@/contexts/pool-user-context";
import { usePoolData } from "@/hooks/use-pool-data";
import { getTotalFlow } from "@/lib/pool";
import PoolCircle from "@/components/Pool/PoolCircle";
import Footer from "./Footer";
import Spinner from "./Spinner";
import BaseButton from "./BaseButton";

interface PoolHQProps {
  chainId: string;
  poolId: string;
}

export default function PoolHQ({ chainId, poolId }: PoolHQProps) {
  const { getCurrentPoolData } = usePool();
  const currentPoolData = getCurrentPoolData();

  const {
    data: poolData,
    poolDistributors,
    poolMembers,
    activeMemberCount,
    isLoading,
    error,
  } = usePoolData({
    chainId: chainId,
    poolId: poolId,
  });

  const { poolDistributors: devPoolistributors } = usePoolData({
    chainId,
    poolId: currentPoolData.DEV_POOL_ID,
  });

  const { user, signIn } = useUser();
  const { address } = useAccount();

  console.log("poolData", poolData);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-lg text-accent-800">
          Failed to load pool. {error.message}
        </p>
      </div>
    );
  }

  if (isLoading || !poolData || !poolDistributors || !devPoolistributors) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user.data) {
    <div className="w-full h-full flex flex-col items-center justify-center">
      <BaseButton onClick={signIn}>Sign In</BaseButton>
    </div>;
  }

  return (
    <PoolUserProvider
      poolDistributors={poolDistributors}
      poolMembers={poolMembers}
      user={user?.data}
      connectedAddress={address}
    >
      <PoolCircle
        connectedUser={user.data || null}
        connectedAddress={address}
        chainId={chainId}
        poolId={poolId}
      />
      <Footer
        chainId={chainId}
        poolId={poolId}
        poolAddress={poolData.id}
        totalFlow={getTotalFlow(poolData.poolDistributors).toString()}
        activeMemberCount={activeMemberCount}
      />
    </PoolUserProvider>
  );
}
