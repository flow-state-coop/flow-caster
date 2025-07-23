import {
  ANIMATION_MINIMUM_STEP_TIME,
  toFixedUsingString,
  useFlowingBalance,
  useSignificantFlowingDecimal,
} from "@/hooks/use-flowing-balance";
import { formatEther } from "viem";

type FlowingBalanceProps = {
  startingBalance: bigint;
  startingBalanceDate: Date;
  flowRate: bigint;
};

export default function FlowingBalance({
  startingBalance,
  startingBalanceDate,
  flowRate,
}: FlowingBalanceProps) {
  const flowingBalance = useFlowingBalance(
    startingBalance,
    startingBalanceDate,
    flowRate
  );

  const decimalPlaces = useSignificantFlowingDecimal(
    flowRate,
    ANIMATION_MINIMUM_STEP_TIME
  );

  return (
    <div className="flowing-balance">
      {decimalPlaces !== undefined
        ? toFixedUsingString(formatEther(flowingBalance), decimalPlaces)
        : formatEther(flowingBalance)}
    </div>
  );
}
