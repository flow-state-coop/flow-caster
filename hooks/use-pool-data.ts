import { useQuery } from "@tanstack/react-query";
import { FEATURED_POOL_DATA, POOL_METADATA } from "@/lib/constants";
import { PoolData } from "@/lib/types";

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
  const { data, ...rest } = useQuery<PoolData>({
    queryKey: ["pool-data", chainId, poolId],
    staleTime: 10000,
    queryFn: async () => {
      const params = new URLSearchParams({
        chainId,
        poolId,
      });

      if (
        poolId === FEATURED_POOL_DATA.DEFAULT_POOL_ID &&
        chainId === FEATURED_POOL_DATA.DEFAULT_CHAIN_ID
      ) {
        params.append("isCrackedDevs", "true");
      }

      const response = await fetch(`/api/pool?${params}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch pool data: ${response.statusText}`);
      }

      return response.json();
    },
    enabled,
  });

  const poolMeta = POOL_METADATA[`${chainId}-${poolId}`];

  return {
    data: data,
    poolDistributors: data?.poolDistributors,
    poolMembers: data?.poolMembers,
    activeMemberCount: data?.activeMemberCount,
    hasSupRewards: poolMeta?.hasSupRewards,
    isCracked: poolMeta?.isCracked,
    ...rest,
  };
};
