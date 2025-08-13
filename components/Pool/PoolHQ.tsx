"use client";
import PoolCircle from "@/components/Pool/PoolCircle";
import { useUser } from "@/contexts/user-context";
import { usePoolData } from "@/hooks/use-pool-data";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { PoolData } from "@/lib/types";
import { getTotalFlow } from "@/lib/pool";
import Footer from "../Shared/Footer";
import { DEV_POOL_ID } from "@/lib/constants";

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
  const [connectedDonor, setConnectedDonor] = useState<
    PoolData["poolDistributors"][0] | undefined
  >();
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
    poolId: DEV_POOL_ID,
  });

  const { user, signIn } = useUser();
  const { address } = useAccount();

  const shouldConnect = useMemo(() => {
    const notConnected = connectedMember && !connectedMember.isConnected;
    const zeroUnits = Number(connectedMember?.units) === 0;
    console.log(
      "shouldConnect connectedMember",
      connectedMember,
      notConnected,
      zeroUnits
    );
    return notConnected || zeroUnits;
  }, [connectedMember]);

  const noUnits = useMemo(() => {
    if (!connectedMember) return false;
    return Number(connectedMember.units) === 0;
  }, [connectedMember]);

  useEffect(() => {
    if (!user.data || !poolMembers) return;
    const member = poolMembers.find(
      (m) => m.account.id === user.data?.verified_addresses.primary.eth_address
    );

    console.log("poolMembers", poolMembers);

    console.log("member", member);
    console.log("address", address);

    setConnectedMember(member);
    if (member && member.account.id.toLowerCase() !== address?.toLowerCase()) {
      setConnectedAddressNotPoolAddress(true);
    }
  }, [poolMembers, address, user]);

  useEffect(() => {
    if (!address || !poolDistributors) return;

    const donor = poolDistributors.find((d) => {
      return d.account.id.toLowerCase() === address.toLowerCase();
    });

    setConnectedDonor(donor);
  }, [poolDistributors, address]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-lg text-red-500">
          Failed to load pool data: {error.message}
        </p>
      </div>
    );
  }

  if (isLoading || !poolData || !poolDistributors || !devPoolistributors) {
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
        devPoolistributors={devPoolistributors}
        poolDistributors={poolDistributors}
        connectedUser={user.data || null}
        connectedAddress={address}
        chainId={chainId}
        poolId={poolId}
      />
      <Footer
        chainId={chainId}
        poolId={poolId}
        shouldConnect={shouldConnect}
        poolAddress={poolData.id}
        connectedAddressNotPoolAddress={connectedAddressNotPoolAddress}
        connectedMember={connectedMember}
        totalFlow={getTotalFlow(poolData.poolDistributors).toString()}
        connectedDonor={connectedDonor}
        noUnits={noUnits}
        activeMemberCount={activeMemberCount}
      />
    </>
  );
}
