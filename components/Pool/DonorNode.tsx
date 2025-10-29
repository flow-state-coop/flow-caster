/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { NeynarUser } from "@/lib/neynar";
import { sdk } from "@farcaster/miniapp-sdk";
import { ArrowRight } from "lucide-react";
import Tippy from "@tippyjs/react";
import {
  formatPoolCount,
  ratePerMonthFormatted,
  truncateAddress,
} from "@/lib/pool";
import FlowAmount from "./FlowAmount";
import "tippy.js/dist/tippy.css";

interface DonorNodeProps {
  x: number;
  y: number;
  radius?: number;
  accountId?: string;
  farcasterUser?: NeynarUser | null | undefined;
  index: number;
  isGroupDonors: boolean;
  isMiddleDonor: boolean;
  donorCount: number;
  connectedUserFallback?: NeynarUser | null | undefined;
  rate?: string;
  startingTimestamp?: string;
  startingAmount?: string;
  tokenSymbol: string;
  iconOverride?: string;
}

export default function DonorNode({
  x,
  y,
  radius = 18,
  accountId,
  farcasterUser,
  index,
  isGroupDonors,
  isMiddleDonor,
  donorCount,
  connectedUserFallback,
  rate,
  startingTimestamp,
  startingAmount,
  tokenSymbol,
  iconOverride,
}: DonorNodeProps) {
  const [showing, setShowing] = useState(false);

  const iconPath = "/images/icon.svg";

  const formattedCount = formatPoolCount(donorCount);
  const donorCountValuesList: Record<
    number,
    { fontSize: string; xOffset: number; yOffset: number }
  > = {
    1: {
      fontSize: "75px",
      xOffset: 21,
      yOffset: 20,
    },
    2: {
      fontSize: "75px",
      xOffset: 42,
      yOffset: 20,
    },
    3: {
      fontSize: "60px",
      xOffset: 49,
      yOffset: 18,
    },
    4: {
      fontSize: "50px",
      xOffset: 45,
      yOffset: 12,
    },
  };
  const donorCountValues =
    donorCountValuesList[formattedCount.length] || donorCountValuesList[4];

  const handleViewProfile = async (fid: number) => {
    await sdk.actions.viewProfile({
      fid,
    });
  };

  return (
    <Tippy
      content={
        <div className="text-xs p-2">
          {farcasterUser && (
            <>
              <div className="flex items-center gap-2 mb-2 ">
                <img
                  src={farcasterUser.pfp_url}
                  alt={farcasterUser.display_name}
                  className="w-6 h-6 rounded-full"
                />
                <div>
                  <div className="font-bold">{farcasterUser.display_name}</div>
                  <div>@{farcasterUser.username}</div>
                </div>
              </div>
            </>
          )}

          {!farcasterUser && accountId && (
            <div>
              <b>Account:</b> {truncateAddress(accountId)}
            </div>
          )}

          {rate && startingTimestamp && (
            <>
              <div className="font-bold text-xl text-accent-800 leading-tight mt-3">
                {ratePerMonthFormatted(rate)}
                <span className="text-xs text-black font-semibold ml-1">
                  {tokenSymbol} / mo
                </span>
              </div>

              <div className="flex flew-row items-baseline gap-1 font-bold text-xl text-accent-800 leading-tight mt-3">
                <FlowAmount
                  startingAmount={BigInt(startingAmount || "0")}
                  startingTimestamp={Number(startingTimestamp)}
                  flowRate={BigInt(rate)}
                />
                <span className="text-xs text-black font-semibold">Total</span>
              </div>
            </>
          )}

          {farcasterUser && (
            <button
              onClick={() => handleViewProfile(Number(farcasterUser.fid))}
              className="flex flew-row items-center gap-1 mt-3 py-1 text-sm text-primary-500 font-semibold hover:text-primary-300"
            >
              View Profile <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      }
      trigger="mouseenter click"
      interactive={true}
      placement="top"
      appendTo={document.body}
      theme="flow"
      className="bg-primary-400"
      onShow={() => setShowing(true)}
      onHide={() => setShowing(false)}
      disabled={!isMiddleDonor}
    >
      <g key={index}>
        {/* Profile image as a clip path */}

        {!isGroupDonors && (
          <defs>
            <clipPath id={`donor-clip-${accountId}-${index}`}>
              <circle cx={x} cy={y} r={radius} />
            </clipPath>
          </defs>
        )}

        {/* Background circle */}
        <circle
          cx={x}
          cy={y}
          r={radius}
          strokeWidth="2"
          className="stroke-black fill-black"
        />

        {/* Profile image */}

        {!isGroupDonors && (
          <image
            href={
              iconOverride ||
              farcasterUser?.pfp_url ||
              connectedUserFallback?.pfp_url ||
              iconPath
            }
            x={x - radius}
            y={y - radius}
            width={radius * 2}
            height={radius * 2}
            clipPath={`url(#donor-clip-${accountId}-${index})`}
            preserveAspectRatio="xMidYMid slice"
            className={isMiddleDonor ? "cursor-pointer" : ""}
          />
        )}

        {isGroupDonors && (
          <>
            <text
              x={x - donorCountValues.xOffset}
              y={y + donorCountValues.yOffset}
              style={{
                fontSize: donorCountValues.fontSize,
                fontWeight: "700",
                fontFamily: "sans-serif",
                fill: "#ffffff",
              }}
            >
              {formattedCount}
            </text>
            <text
              x={x - 31}
              y={y + 42}
              style={{
                fontSize: "18px",
                fontFamily: "sans-serif",
                fontWeight: "700",
                fill: "#ffffff",
              }}
            >
              donors
            </text>
          </>
        )}
      </g>
    </Tippy>
  );
}
