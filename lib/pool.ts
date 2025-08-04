import { NeynarUser } from "./neynar";
import { formatEther } from "viem";
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
  connectedUser: NeynarUser | null | undefined,
  connectedAddress: `0x${string}` | undefined
) => {
  const topDonor =
    poolDistributors.length > 0
      ? poolDistributors.reduce((highest, current) => {
          const currentRate = parseFloat(current.flowRate);
          const highestRate = parseFloat(highest.flowRate);

          // Skip invalid numbers
          if (isNaN(currentRate)) return highest;
          if (isNaN(highestRate)) return current;

          return currentRate > highestRate ? current : highest;
        })
      : undefined;

  console.log("topDonor", topDonor);

  console.log("connectedUser", connectedUser);

  // let connectedDonor = poolDistributors.find(
  //   (d) =>
  //     d.account.id.toLowerCase() === connectedAddress?.toLowerCase() ||
  //     d.account.id.toLowerCase() ===
  //       connectedUser?.verified_addresses.primary.eth_address.toLowerCase() ||
  //     d.account.id.toLowerCase() ===
  //       connectedUser?.verified_addresses.eth_addresses[0].toLowerCase()
  // );

  let connectedDonor = poolDistributors.find(
    (d) => d.account.id.toLowerCase() === connectedAddress?.toLowerCase()
  );

  console.log("connectedDonor", connectedDonor);

  const totalFlow = getTotalFlow(poolDistributors);

  const totalDonor = {
    accountId: `${poolDistributors.length} Total`,
    rate: totalFlow.toString(),
    farcasterUser: null,
  };

  const connectAndTop = [connectedDonor, topDonor].map((distributor) => ({
    accountId: distributor?.account.id,
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
  ).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
};

export const ratePerMonthFormattedNoLocale = (flowRate: number | string) => {
  return Number(
    formatEther(BigInt(flowRate) * BigInt(streamGranularityInSeconds.month))
  ).toFixed(2);
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
export function formatPoolCount(num: number) {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
}
