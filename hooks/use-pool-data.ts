import { useQuery } from "@tanstack/react-query";

export interface NeynarUser {
  fid: string;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  verifications: string[];
}

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
}

interface UsePoolDataOptions {
  chainId: string;
  poolId: string;
  enabled?: boolean;
}

export const usePoolData = ({
  chainId,
  poolId,
  enabled = true,
}: UsePoolDataOptions) => {
  return useQuery<PoolData>({
    queryKey: ["pool-data", chainId, poolId],
    queryFn: async () => {
      const params = new URLSearchParams({
        chainId,
        poolId,
      });

      const response = await fetch(`/api/pool?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch pool data: ${response.statusText}`);
      }

      return response.json();
    },
    enabled,
  });
};
