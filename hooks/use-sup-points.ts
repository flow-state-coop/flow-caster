import { useQuery } from "@tanstack/react-query";

interface SupPointsData {
  flowRate: string;
  lockerAddress: string;
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

      if (!res.ok) throw new Error("Failed to fetch SUP points");
      return res.json();
    },
    enabled: !!userAddress,
  });
};
