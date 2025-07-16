import { formatEther } from "viem";
import FlowAmount from "./FlowAmount";
import { ratePerMonthFormatted } from "@/lib/pool";

interface DonorStatsProps {
  rate: string;
  showSup: boolean;
  showTotalFlow: boolean;
  startingAmount?: string;
  startingTimestamp?: string;
}

export default function DonorStats({
  rate,
  showSup,
  showTotalFlow,
  startingAmount,
  startingTimestamp,
}: DonorStatsProps) {
  return (
    <div className="text-[10px] text-center flex flex-col items-center text-black font-bold w-full">
      {/* <div>{`${Number(formatEther(BigInt(rate))).toFixed(3)} USDCx / mo`}</div> */}
      <div>{`~ ${ratePerMonthFormatted(rate)} USDCx / mo`}</div>

      {showTotalFlow && (
        <FlowAmount
          startingAmount={BigInt(startingAmount || "0")}
          startingTimestamp={Number(startingTimestamp)}
          flowRate={BigInt(rate)}
        />
      )}

      {showSup && (
        <div className="text-brand-sfGreen">
          +{`${Number(formatEther(BigInt(rate))).toFixed(2)} SUP / mo`}
        </div>
      )}
    </div>
  );
}
