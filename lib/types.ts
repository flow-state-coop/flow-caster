import { NeynarUser } from "@/lib/neynar";

export interface PoolData {
  __typename: string;
  id: string;
  flowRate: string;
  totalUnits: string;
  totalAmountFlowedDistributedUntilUpdatedAt: string;
  totalAmountInstantlyDistributedUntilUpdatedAt: string;
  updatedAtTimestamp: string;
  poolMembers: Array<{
    __typename: string;
    account: {
      __typename: string;
      id: string;
    };
    units: string;
    isConnected: boolean;
    farcasterUser: NeynarUser | null;
  }>;
  poolDistributors: Array<{
    __typename: string;
    account: {
      __typename: string;
      id: string;
    };
    flowRate: string;
    farcasterUser: NeynarUser | null;
  }>;
  token: {
    __typename: string;
    id: string;
    symbol: string;
  };
  poolMeta: {
    name: string;
    symbol: string;
  };
}
