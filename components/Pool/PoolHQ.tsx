"use client";
import PoolCircle from "@/components/Pool/PoolCircle";
import PoolActions from "@/components/Pool/PoolActions";
import { useUser } from "@/contexts/user-context";
import { usePoolData } from "@/hooks/use-pool-data";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { PoolData } from "@/lib/types";

export default function PoolHQ({
  chainId,
  poolId,
}: {
  chainId: string;
  poolId: string;
}) {
  const [connectedMember, setConnectedMember] = useState<
    PoolData["poolMembers"][0] | undefined
  >();
  const [connectedAddressNotPoolAddress, setConnectedAddressNotPoolAddress] =
    useState(false);
  const {
    data: poolData,
    isLoading,
    error,
  } = usePoolData({
    chainId: chainId,
    poolId: poolId,
  });
  const { user, signIn } = useUser();
  const { address } = useAccount();

  const shouldConnect = useMemo(() => {
    return connectedMember && !connectedMember.isConnected;
  }, [connectedMember]);

  useEffect(() => {
    if (!user.data || !poolData || !address) return;
    const member = poolData.poolMembers.find(
      (d) =>
        d.account.id === user.data?.verified_addresses.primary.eth_address ||
        d.account.id === user.data?.verified_addresses.eth_addresses[0]
    );

    if (member && member.account.id !== address) {
      setConnectedMember(member);
      setConnectedAddressNotPoolAddress(true);
    }
  }, [poolData, address, user]);

  console.log("poolData", poolData);

  const handleOpenStream = () => {
    // This will be called from PoolActions component
    console.log("Opening stream from PoolActions");
  };
  const handleClaimSup = () => {
    // This will be called from PoolActions component
    console.log("Opening stream from PoolActions");
  };

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-lg text-red-500">
          Failed to load pool data: {error.message}
        </p>
      </div>
    );
  }

  if (isLoading || !poolData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-lg">Loading pool data...</p>
      </div>
    );
  }

  if (!user.data) {
    <div className="w-full h-full flex flex-col items-center justify-center">
      <button onClick={signIn}>Sign In</button>
    </div>;
  }

  return (
    <>
      <PoolCircle
        poolData={poolData}
        connectedUser={user.data}
        onOpenStream={handleOpenStream}
      />
      <PoolActions
        onOpenStream={handleOpenStream}
        onClaimSup={handleClaimSup}
        chainId={chainId}
        poolId={poolId}
        shouldConnect={shouldConnect}
        poolAddress={poolData.id}
        connectedAddressNotPoolAddress={connectedAddressNotPoolAddress}
        connectedMember={connectedMember}
      />
    </>
  );
}
