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
  devPoolistributors: PoolData["poolDistributors"],
  connectedAddress: `0x${string}` | undefined
) => {
  const devPoolRateList = devPoolistributors.reduce((acc, d) => {
    acc[d.account.id] = d.flowRate;
    return acc;
  }, {} as Record<string, string>);

  const withDevPoolRate = poolDistributors.reduce((acc, d) => {
    const devRate = devPoolRateList[d.account.id];
    if (devRate) {
      acc.push({
        ...d,
        flowRate: (Number(d.flowRate) + Number(devRate)).toString(),
      });
    } else {
      acc.push(d);
    }
    return acc;
  }, [] as PoolData["poolDistributors"]);

  const sorted = withDevPoolRate.sort(
    (a, b) => parseFloat(b.flowRate) - parseFloat(a.flowRate)
  );

  const topDonor = sorted[0];

  let connectedDonor = poolDistributors.find(
    (d) => d.account.id.toLowerCase() === connectedAddress?.toLowerCase()
  );

  let connectedDevPoolDonor = devPoolistributors.find(
    (d) => d.account.id.toLowerCase() === connectedAddress?.toLowerCase()
  );

  if (connectedDonor && connectedDevPoolDonor) {
    connectedDonor = {
      ...connectedDonor,
      flowRate: (
        Number(connectedDonor.flowRate) + Number(connectedDevPoolDonor.flowRate)
      ).toString(),
    };
  }

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
    startingAmount: distributor?.totalAmountDistributedUntilUpdatedAt,
    startingTimestamp: distributor?.updatedAtTimestamp,
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

export const displayIndividualFlowRate = (
  totalUnits: number | string,
  units: number | string,
  flowRate: number | string
) => {
  const perc = ((100 / Number(totalUnits)) * Number(units)) / 100;

  const rate = ratePerMonth(flowRate);

  const eth = formatEther(BigInt(perc * Number(rate)));

  return Number(eth).toFixed(2);
};

export const streamGranularityInSeconds = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400,
  week: 86400 * 7,
  month: 2628000,
};

export const individualRatePerMonth = (
  totalUnits: number | string,
  units: number | string,
  flowRate: number | string
) => {
  return BigInt(flowRate) * BigInt(streamGranularityInSeconds.month);
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

  return flowingAmount;
};

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
