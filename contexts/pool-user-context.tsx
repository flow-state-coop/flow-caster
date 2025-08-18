import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { NeynarUser } from "@/lib/neynar";
import { PoolData } from "@/lib/types";

interface PoolUserContextType {
  connectedMember: PoolData["poolMembers"][0] | undefined;
  connectedAddressNotPoolAddress: boolean;
  connectedDonor: PoolData["poolDistributors"][0] | undefined;
  shouldConnect: boolean;
  noUnits: boolean;
}

const PoolUserProviderContext = createContext<PoolUserContextType | undefined>(
  undefined
);

interface PoolUserProviderProps {
  children: ReactNode;
  poolMembers: PoolData["poolMembers"] | undefined;
  poolDistributors: PoolData["poolDistributors"];
  connectedAddress: `0x${string}` | undefined;
  user: NeynarUser | null | undefined;
}

export const usePoolUser = () => {
  const context = useContext(PoolUserProviderContext);
  if (!context) {
    throw new Error("usePoolUser must be used within a PoolUserProvider");
  }
  return context;
};

export const PoolUserProvider = ({
  children,
  poolMembers,
  poolDistributors,
  user,
  connectedAddress,
}: PoolUserProviderProps) => {
  const [connectedMember, setConnectedMember] = useState<
    PoolData["poolMembers"][0] | undefined
  >();
  const [connectedAddressNotPoolAddress, setConnectedAddressNotPoolAddress] =
    useState(false);
  const [connectedDonor, setConnectedDonor] = useState<
    PoolData["poolDistributors"][0] | undefined
  >();

  useEffect(() => {
    if (!user || !poolMembers) return;
    const member = poolMembers.find(
      (m) => m.account.id === user.verified_addresses.primary.eth_address
    );

    console.log("poolMembers", poolMembers);
    console.log("member", member);
    console.log("address", connectedAddress);

    setConnectedMember(member);
    if (
      member &&
      member.account.id.toLowerCase() !== connectedAddress?.toLowerCase()
    ) {
      setConnectedAddressNotPoolAddress(true);
    }
  }, [poolMembers, connectedAddress, user]);

  useEffect(() => {
    if (!connectedAddress || !poolDistributors) return;

    const donor = poolDistributors.find((d) => {
      return d.account.id.toLowerCase() === connectedAddress.toLowerCase();
    });

    setConnectedDonor(donor);
  }, [poolDistributors, connectedAddress]);

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

  const value = useMemo(() => {
    return {
      connectedMember,
      connectedAddressNotPoolAddress,
      connectedDonor,
      shouldConnect,
      noUnits,
    };
  }, [
    connectedMember,
    connectedAddressNotPoolAddress,
    connectedDonor,
    noUnits,
    shouldConnect,
  ]);

  return (
    <PoolUserProviderContext.Provider value={value}>
      {children}
    </PoolUserProviderContext.Provider>
  );
};
