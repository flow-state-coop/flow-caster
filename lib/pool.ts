import { MiniAppContext } from "@farcaster/miniapp-core/dist/context";
import { NeynarUser } from "./neynar";
import { formatEther, formatUnits } from "viem";
import { PoolData } from "./types";

export const getTotalFlow = (
  poolDistributors: PoolData["poolDistributors"]
) => {
  return poolDistributors.reduce((total, current) => {
    try {
      const currentRate = BigInt(current.flowRate);
      return total + currentRate;
    } catch (error) {
      // Skip invalid BigInt values
      console.warn(`Invalid flowRate value: ${current.flowRate}`);
      return total;
    }
  }, BigInt(0));
};

export const createDonorBuckets = (
  poolDistributors: PoolData["poolDistributors"],
  connectedUser: NeynarUser | null
) => {
  const topDonor = poolDistributors.reduce((highest, current) => {
    const currentRate = parseFloat(current.flowRate);
    const highestRate = parseFloat(highest.flowRate);

    // Skip invalid numbers
    if (isNaN(currentRate)) return highest;
    if (isNaN(highestRate)) return current;

    return currentRate > highestRate ? current : highest;
  });

  let connectedDonor = poolDistributors.find(
    (d) =>
      d.account.id === connectedUser?.verified_addresses.primary.eth_address ||
      d.account.id === connectedUser?.verified_addresses.eth_addresses[0]
  );

  const totalFlow = getTotalFlow(poolDistributors);

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

export const displayIndividualFlowPercentage = (
  totalUnits: number | string,
  units: number | string
) => {
  return ((100 / Number(totalUnits)) * Number(units)).toFixed(2);
};

export const getMemberFlowRate = (
  totalUnits: number | string,
  units: number | string,
  flowRate: number | string
) => {
  const perc = ((100 / Number(totalUnits)) * Number(units)) / 100;

  const dude = BigInt(perc * Number(flowRate));
  console.log("dude", dude);
  return dude;
  // return Number(eth).toFixed(6);
};

export const displayIndividualFlowRate = (
  totalUnits: number | string,
  units: number | string,
  flowRate: number | string
) => {
  const perc = ((100 / Number(totalUnits)) * Number(units)) / 100;

  const eth = formatEther(BigInt(perc * Number(flowRate)));

  return Number(eth).toFixed(6);
};

export const streamGranularityInSeconds = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400,
  week: 86400 * 7,
  month: 2628000,
};

export const ratePerMonth = (flowRate: number | string) => {
  return BigInt(flowRate) * BigInt(streamGranularityInSeconds.month);
};
export const ratePerMonthWei = (flowRate: number | string) => {
  return formatEther(
    BigInt(flowRate) * BigInt(streamGranularityInSeconds.month)
  );
};
export const ratePerMonthFormatted = (flowRate: number | string) => {
  return Number(
    formatEther(BigInt(flowRate) * BigInt(streamGranularityInSeconds.month))
  ).toFixed(0);
};

export const totalFlowedStatic = (
  flowRate: number | string,
  startingTimestamp: string | number,
  startingAmount: string | number
) => {
  const rate = ratePerMonth(flowRate);
  const elapsedTimeInMilliseconds = BigInt(
    Date.now() - Number(startingTimestamp) * 1000
  );
  const flowingAmount =
    BigInt(startingAmount) +
    (BigInt(flowRate) * elapsedTimeInMilliseconds) / BigInt(1000);

  console.log("flowingAmount", flowingAmount);

  return flowingAmount;
};

// const elapsedTimeInMilliseconds = BigInt(
//   Date.now() - startingTimestamp * 1000
// );
// const flowingAmount =
//   startingAmount +
//   (flowRate * elapsedTimeInMilliseconds) / BigInt(1000);

export const TIME_UNIT = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400,
  week: 604800,
  month: 2628000,
  year: 31536000,
} as const;

export type TimeUnit = (typeof TIME_UNIT)[keyof typeof TIME_UNIT];
export function calculateFlowratePerSecond({
  amountWei,
  timeUnit,
}: {
  amountWei: bigint;
  timeUnit: TimeUnit;
}) {
  return amountWei / BigInt(timeUnit);
}
