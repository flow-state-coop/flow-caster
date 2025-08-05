import { NeynarUser } from "@/lib/neynar";
import { PoolData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

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
    // staleTime: 10000,
    queryFn: async () => {
      const params = new URLSearchParams({
        chainId,
        poolId,
      });

      const response = await fetch(`/api/pool?${params}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch pool data: ${response.statusText}`);
      }

      console.log("fetched");

      return response.json();
    },
    enabled,
  });
};
