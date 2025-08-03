"use client";
import PoolCircle from "@/components/Pool/PoolCircle";
import { useUser } from "@/contexts/user-context";
import { usePoolData } from "@/hooks/use-pool-data";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { PoolData } from "@/lib/types";
import { getTotalFlow } from "@/lib/pool";
import Footer from "../Shared/Footer";

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
    if (!user.data || !poolData) return;
    const member = poolData.poolMembers.find(
      (m) =>
        m.account.id === user.data?.verified_addresses.primary.eth_address ||
        m.account.id === user.data?.verified_addresses.eth_addresses[0]
    );

    console.log("member", member?.account.id.toLowerCase());
    console.log("address", address?.toLowerCase());
    console.log("user", user);

    setConnectedMember(member);
    if (member && member.account.id.toLowerCase() !== address?.toLowerCase()) {
      setConnectedAddressNotPoolAddress(true);
    }
  }, [poolData, address, user]);

  useEffect(() => {
    if (!address || !poolData) return;

    const donor = poolData.poolDistributors.find((d) => {
      return d.account.id.toLowerCase() === address.toLowerCase();
    });

    setConnectedDonor(donor);
  }, [poolData, address]);

  console.log("poolData", poolData);

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
        connectedUser={user.data || null}
        connectedAddress={address}
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
      />
    </>
  );
}
