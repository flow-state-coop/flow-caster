"use client";

import { useAccountSup } from "@/hooks/use-account-sup";
import { ratePerMonthFormatted } from "@/lib/pool";
import FlowAmount from "./FlowAmount";

interface DonorStatsProps {
  rate: string;
  showSup: boolean;
  showTotalFlow: boolean;
  startingAmount?: string;
  startingTimestamp?: string;
  donorAddress?: string;
  tokenSymbol: string;
}

export default function DonorStats({
  rate,
  showSup,
  showTotalFlow,
  startingAmount,
  startingTimestamp,
  donorAddress,
  tokenSymbol,
}: DonorStatsProps) {
  const { data } = useAccountSup({
    userAddress:
      donorAddress && donorAddress.startsWith("0x") ? donorAddress : undefined,
  });

  return (
    <div className="text-[10px] text-center flex flex-col items-center text-black font-bold w-full">
      <div>{`${ratePerMonthFormatted(rate)} ${tokenSymbol} / mo`}</div>

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
          <div>{`${ratePerMonthFormatted(data.flowRate)} SUP / mo`}</div>
        </div>
      )}
    </div>
  );
}
