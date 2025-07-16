/* eslint-disable @next/next/no-img-element */
import { ratePerMonthFormatted, totalFlowedStatic } from "@/lib/pool";
import { PoolData } from "@/lib/types";
import { CircleUserRound, Crown } from "lucide-react";
import { useMemo } from "react";
import { formatEther } from "viem";
import FlowAmount from "../Pool/FlowAmount";

interface LeaderboardListProps {
  poolData?: PoolData;
}

function truncateAddress(address: string, length = 6) {
  return address.slice(0, length) + "..." + address.slice(-4);
}

export default function LeaderboardList({ poolData }: LeaderboardListProps) {
  const sorted = useMemo(() => {
    const distributors = poolData?.poolDistributors || [];
    // Sort by flowRate (descending)
    return [...distributors].sort(
      (a, b) => parseFloat(b.flowRate) - parseFloat(a.flowRate)
    );
  }, [poolData]);

  return (
    <div className="w-full max-w-md mx-auto bg-white">
      <div className="flex flex-row justify-between items-center w-full mb-4">
        <p className="text-sm font-bold text-black">
          Cracked Farcaster Devs Donor Leaderboard
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2 text-xs text-primary-500 mb-2 px-2">
        <div className="col-span-2">&nbsp;</div>
        <div className="text-right">USDCx/mo</div>
        <div className="text-right">Total</div>
      </div>
      <div className="divide-y divide-primary-200 text-black bg-brand-light rounded-lg py-3">
        {sorted.map((d, i) => {
          const isTop = i === 0;
          const user = d.farcasterUser;
          return (
            <div
              key={d.account.id}
              className="flex items-center py-2 px-2 gap-2 text-lg font-mono"
            >
              <div className="w-5 text-right mr-1 font-bold">
                {isTop && (
                  <Crown fill="gold" className="w-6 h-6 text-yellow-400" />
                )}

                {!isTop && <>{i + 1}</>}
              </div>
              <div className="w-8 h-8 flex items-center justify-center relative">
                {/* {isTop && (
                  <Crown
                    fill="gold"
                    className="w-16 h-16 text-yellow-300 absolute z-0"
                  />
                )} */}
                {user?.pfp_url ? (
                  <img
                    src={user.pfp_url}
                    alt={user.display_name || user.username}
                    className="w-8 h-8 rounded-full border-2 border-primary-500 relative z-10"
                  />
                ) : (
                  <CircleUserRound className="w-8 h-8 text-primary-500 relative z-10" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-black text-xs">
                  {user?.username
                    ? user.username
                    : truncateAddress(d.account.id)}
                </span>
              </div>
              <div className="w-20 text-right tabular-nums text-sm font-bold">
                {`~ ${ratePerMonthFormatted(d.flowRate)}`}
              </div>
              <div className="w-24 text-right tabular-nums text-sm font-bold">
                {/* {`${Number(
                  totalFlowedStatic(
                    d.flowRate,
                    d.updatedAtTimestamp,
                    d.totalAmountDistributedUntilUpdatedAt
                  )
                ).toFixed(2)}`} */}

                <FlowAmount
                  startingAmount={BigInt(
                    d.totalAmountDistributedUntilUpdatedAt || "0"
                  )}
                  startingTimestamp={Number(d.updatedAtTimestamp)}
                  flowRate={BigInt(d.flowRate)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
