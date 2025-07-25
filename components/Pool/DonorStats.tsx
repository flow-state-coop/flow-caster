"use client";

import FlowAmount from "./FlowAmount";
import { ratePerMonthFormatted } from "@/lib/pool";
import { useSupPoints } from "@/hooks/use-sup-points";

interface DonorStatsProps {
  rate: string;
  showSup: boolean;
  showTotalFlow: boolean;
  startingAmount?: string;
  startingTimestamp?: string;
  donorAddress?: string;
}

export default function DonorStats({
  rate,
  showSup,
  showTotalFlow,
  startingAmount,
  startingTimestamp,
  donorAddress,
}: DonorStatsProps) {
  const { data } = useSupPoints({
    userAddress:
      donorAddress && donorAddress.startsWith("0x") ? donorAddress : undefined,
  });

  return (
    <div className="text-[10px] text-center flex flex-col items-center text-black font-bold w-full">
      <div>{`~ ${ratePerMonthFormatted(rate)} USDCx / mo`}</div>

      {showTotalFlow && (
        <FlowAmount
          startingAmount={BigInt(startingAmount || "0")}
          startingTimestamp={Number(startingTimestamp)}
          flowRate={BigInt(rate)}
          textAfter="Total"
        />
      )}

      {showSup && data && (
        <div className="text-brand-sfGreen">
          <FlowAmount
            textBefore="+"
            textAfter="SUP / mo"
            startingAmount={BigInt(data.balanceUntilUpdatedAt || "0")}
            startingTimestamp={Number(data.updatedAtTimestamp)}
            flowRate={BigInt(data.totalNetFlowRate)}
          />
        </div>
      )}
    </div>
  );
}
