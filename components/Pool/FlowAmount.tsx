"use client";

import { formatEther } from "viem";
import useFlowingAmount from "@/hooks/use-flowing-amount";

interface FlowAmountProps {
  startingAmount: bigint;
  startingTimestamp: number;
  flowRate: bigint;
  textBefore?: string;
  textAfter?: string;
}

export default function FlowAmount({
  startingAmount,
  startingTimestamp,
  flowRate,
  textBefore,
  textAfter,
}: FlowAmountProps) {
  const flowingAmount = useFlowingAmount(
    startingAmount,
    startingTimestamp,
    flowRate
  );

  return (
    <>
      <div>{`${textBefore ? textBefore : ""} ${Number(
        formatEther(flowingAmount)
      ).toLocaleString("en-US", {
        maximumFractionDigits: 4,
        minimumFractionDigits: 4,
      })} ${textAfter ? textAfter : ""}`}</div>
    </>
  );
}
