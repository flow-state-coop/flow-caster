import { PoolData } from "@/hooks/use-pool-data";
import { MiniAppContext } from "@farcaster/miniapp-core/dist/context";
import { NeynarUser } from "./neynar";
import { formatUnits } from "viem";

export const createDonorBuckets = (
  poolDistributors: PoolData["poolDistributors"],
  connectedUser?: NeynarUser
) => {
  const topDonor = poolDistributors.reduce((highest, current) => {
    const currentRate = parseFloat(current.flowRate);
    const highestRate = parseFloat(highest.flowRate);

    // Skip invalid numbers
    if (isNaN(currentRate)) return highest;
    if (isNaN(highestRate)) return current;

    return currentRate > highestRate ? current : highest;
  });

  const connectedDonor = poolDistributors.find(
    (d) =>
      d.account.id === connectedUser?.verified_addresses.primary.eth_address ||
      d.account.id === connectedUser?.verified_addresses.eth_addresses[0]
  );

  const totalFlow = poolDistributors.reduce((total, current) => {
    try {
      const currentRate = BigInt(current.flowRate);
      return total + currentRate;
    } catch (error) {
      // Skip invalid BigInt values
      console.warn(`Invalid flowRate value: ${current.flowRate}`);
      return total;
    }
  }, BigInt(0));

  const totalDonor = {
    accountId: `${poolDistributors.length} Total`,
    // rate: formatUnits(totalFlow, 18),
    rate: totalFlow.toString(),
    farcasterUser: null,
  };

  const connectAndTop = [connectedDonor, topDonor].map((distributor) => ({
    accountId: distributor?.account.id,
    // rate: formatUnits(BigInt(distributor?.flowRate || "0"), 18),
    rate: distributor?.flowRate || "0",

    farcasterUser: distributor?.farcasterUser,
  }));

  return [...connectAndTop, totalDonor];
};

export const truncateAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

export const truncateString = (addr: string, numChars: number) =>
  `${addr.slice(0, numChars)}...${addr.slice(-numChars)}`;
