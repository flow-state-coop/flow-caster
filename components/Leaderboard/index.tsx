"use client";
import { useEffect, useState } from "react";
import { usePoolData } from "@/hooks/use-pool-data";
import { useParams } from "next/navigation";
import LeaderboardList from "./LeaderboardList";
import { getTotalFlow } from "@/lib/pool";
import Footer from "../Shared/Footer";
import { PoolData } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import { useAccount } from "wagmi";
import { DEV_POOL_ID } from "@/lib/constants";

export default function Leaderboard() {
  const { chainId, poolId } = useParams<{ chainId: string; poolId: string }>();
  const [connectedMember, setConnectedMember] = useState<
    PoolData["poolMembers"][0] | undefined
  >();
  const [connectedAddressNotPoolAddress, setConnectedAddressNotPoolAddress] =
    useState(false);
  const [connectedDonor, setConnectedDonor] = useState<
    PoolData["poolDistributors"][0] | undefined
  >();
  const [devPoolList, setDevPoolList] = useState<
    Record<string, string> | undefined
  >();
  const {
    data: poolData,
    poolDistributors,
    poolMembers,
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
  const { user } = useUser();
  const { address } = useAccount();

  useEffect(() => {
    if (!user.data || !poolMembers) return;
    const member = poolMembers.find(
      (m) =>
        m.account.id === user.data?.verified_addresses.primary.eth_address ||
        m.account.id === user.data?.verified_addresses.eth_addresses[0]
    );

    setConnectedMember(member);
    if (
      member &&
      member.account.id.toLowerCase() !== address?.toLocaleLowerCase()
    ) {
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

  useEffect(() => {
    if (!devPoolistributors) return;

    const rateList = devPoolistributors.reduce((acc, d) => {
      acc[d.account.id] = d.flowRate;
      return acc;
    }, {} as Record<string, string>);

    setDevPoolList(rateList);
  }, [devPoolistributors]);

  if (isLoading || !poolData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-lg">Loading pool data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-lg text-red-500">
          Failed to load pool data: {error.message}
        </p>
      </div>
    );
  }

  return (
    <main className="relative">
      <LeaderboardList poolData={poolData} devPoolList={devPoolList} />
      <Footer
        chainId={chainId}
        poolId={poolId}
        poolAddress={poolData.id}
        connectedAddressNotPoolAddress={connectedAddressNotPoolAddress}
        connectedMember={connectedMember}
        totalFlow={getTotalFlow(poolData.poolDistributors).toString()}
        connectedDonor={connectedDonor}
      />
    </main>
  );
}
