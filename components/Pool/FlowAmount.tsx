import useFlowingAmount from "@/hooks/use-flowing-amount";
import { useSupPoints } from "@/hooks/use-sup-points";
import { useEffect } from "react";
import { formatEther } from "viem";

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
      ).toFixed(3)} ${textAfter ? textAfter : ""}`}</div>
    </>
  );
}
