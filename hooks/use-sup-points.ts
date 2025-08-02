import { useQuery } from "@tanstack/react-query";

interface SupPointsData {
  balanceUntilUpdatedAt: string;
  totalNetFlowRate: string;
  updatedAtTimestamp: string;
  totalInflowRate: string;
}

interface UseSupPointsOptions {
  userAddress?: string;
}

export const useSupPoints = ({ userAddress }: UseSupPointsOptions) => {
  return useQuery<SupPointsData | null>({
    queryKey: ["sup-points", userAddress],
    queryFn: async () => {
      const res = await fetch(`/api/sup-balance?address=${userAddress}`, {
        cache: "no-store",
      });

      console.log("res", res);
      if (!res.ok) throw new Error("Failed to fetch SUP points");
      return res.json();
    },
    enabled: !!userAddress,
  });
};
