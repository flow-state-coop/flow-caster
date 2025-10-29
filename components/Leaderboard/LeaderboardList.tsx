/* eslint-disable @next/next/no-img-element */
import { useMemo } from "react";
import { Crown } from "lucide-react";
import { sdk } from "@farcaster/miniapp-sdk";
import { ratePerMonthFormatted } from "@/lib/pool";
import { PoolData } from "@/lib/types";
import FlowAmount from "../Pool/FlowAmount";
import { usePool } from "@/contexts/pool-context";

interface LeaderboardListProps {
  poolData?: PoolData;
  devPoolList?: Record<string, string>;
  sponsorAddress?: string;
  iconOverride?: string;
}

function truncateAddress(address: string, length = 6) {
  return address.slice(0, length) + "..." + address.slice(-4);
}

export default function LeaderboardList({
  poolData,
  devPoolList,
  sponsorAddress,
  iconOverride,
}: LeaderboardListProps) {
  const sorted = useMemo(() => {
    const devPoleRateList = devPoolList || {};
    const distributors = poolData?.poolDistributors || [];
    const withDevPoolRate = distributors.reduce((acc, d) => {
      const devRate = devPoleRateList[d.account.id];
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

    const sorted = [...withDevPoolRate].sort(
      (a, b) => parseFloat(b.flowRate) - parseFloat(a.flowRate)
    );

    return sorted;
  }, [poolData, devPoolList]);

  const handleViewProfile = async (isSponsor: boolean, fid?: string) => {
    if (!fid || isSponsor) return;
    await sdk.actions.viewProfile({
      fid: Number(fid),
    });
  };

  if (!poolData) return;

  return (
    <div className="w-full max-w-md mx-auto bg-white">
      <h2 className="text-3xl text-primary-500 font-bold mb-3">
        Donor Leaderboard
      </h2>
      <div className="grid grid-cols-4 gap-2 text-xs text-primary-500 mb-2 px-2">
        <div className="col-span-2">&nbsp;</div>
        <div className="text-right">{poolData.token.symbol}/mo</div>
        <div className="text-right">Total</div>
      </div>
      <div className="divide-y divide-primary-200 text-black bg-brand-light rounded-lg py-3 mb-24">
        {sorted.map((d, i) => {
          const isTop = i === 0;
          const user = d.farcasterUser;
          const isSponsor =
            sponsorAddress &&
            sponsorAddress.toLowerCase() === d.account.id.toLowerCase();
          const iconPath = isSponsor ? iconOverride : "/images/icon.png";
          return (
            <div
              key={d.account.id}
              className={`flex items-center py-2 px-2 gap-2 text-base font-mono ${
                user?.fid && "hover:bg-primary-200"
              }`}
              onClick={() => handleViewProfile(!!isSponsor, user?.fid)}
            >
              <div className="w-5 text-right mr-2 font-bold">
                {isTop && (
                  <Crown fill="gold" className="w-6 h-6 text-yellow-400" />
                )}

                {!isTop && <>{i + 1}</>}
              </div>
              <div className="w-8 h-8 flex items-center justify-center relative">
                {user?.pfp_url && !isSponsor ? (
                  <img
                    src={user.pfp_url}
                    alt={user.display_name || user.username}
                    className="w-8 h-8 rounded-full relative z-10"
                  />
                ) : (
                  <img
                    src={iconPath}
                    alt="fs logo"
                    className="w-8 h-8 rounded-full relative z-10"
                  />
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
                {`${ratePerMonthFormatted(d.flowRate)}`}
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
