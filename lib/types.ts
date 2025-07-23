import { NeynarUser } from "@/lib/neynar";

export interface PoolData {
  __typename: string;
  id: string;
  flowRate: string;
  totalUnits: string;
  totalAmountDistributedUntilUpdatedAt: string;
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
    poolTotalAmountDistributedUntilUpdatedAt: string;
    updatedAtTimestamp: string;
    farcasterUser: NeynarUser | null;
  }>;
  poolDistributors: Array<{
    __typename: string;
    account: {
      __typename: string;
      id: string;
    };
    flowRate: string;
    totalAmountDistributedUntilUpdatedAt: string;
    updatedAtTimestamp: string;
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
