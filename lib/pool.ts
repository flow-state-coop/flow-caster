import { PoolData } from "@/hooks/use-pool-data";
import { MiniAppContext } from "@farcaster/miniapp-core/dist/context";
import { NeynarUser } from "./neynar";

export const createDonorBuckets = (
  poolDistributors: PoolData["poolDistributors"],
  connectedUser?: NeynarUser
) => {
  //get higest
  //get connected
  // total the rest
  let donors = [];

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

  console.log("connectedDonor", connectedDonor);

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
    rate: totalFlow,
  };

  const connectAndTop = [connectedDonor, topDonor].map((distributor) => ({
    accountId: distributor?.account.id,
    rate: distributor?.flowRate,
    farcasterUser: distributor?.farcasterUser,
  }));

  return [...connectAndTop, totalDonor];
};
