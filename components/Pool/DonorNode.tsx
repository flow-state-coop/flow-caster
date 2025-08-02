/* eslint-disable @next/next/no-img-element */
"use client";
import { NeynarUser } from "@/lib/neynar";
import { formatPoolCount } from "@/lib/pool";
import "tippy.js/dist/tippy.css";

interface DonorNodeProps {
  x: number;
  y: number;
  radius?: number;
  accountId?: string;
  farcasterUser?: NeynarUser | null | undefined;
  index: number;
  isGroupDonors: boolean;
  donorCount: number;
  connectedUserFallback?: NeynarUser | null | undefined;
}

export default function DonorNode({
  x,
  y,
  radius = 18,
  accountId,
  farcasterUser,
  index,
  isGroupDonors,
  donorCount,
  connectedUserFallback,
}: DonorNodeProps) {
  const iconPath = "/images/icon.svg";

  const donorCountTmp = 3333;

  const formattedCount = formatPoolCount(donorCountTmp);

  console.log("formattedCount", formattedCount);

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

  return (
    <g key={index}>
      {/* Profile image as a clip path */}

      {!isGroupDonors && (
        <defs>
          <clipPath id={`donor-clip-${accountId}`}>
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
            farcasterUser?.pfp_url || connectedUserFallback?.pfp_url || iconPath
          }
          x={x - radius}
          y={y - radius}
          width={radius * 2}
          height={radius * 2}
          clipPath={`url(#donor-clip-${accountId})`}
          preserveAspectRatio="xMidYMid slice"
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
  );
}
