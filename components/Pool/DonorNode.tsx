/* eslint-disable @next/next/no-img-element */
"use client";
import { NeynarUser } from "@/lib/neynar";
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
            x={x - 21}
            y={y + 20}
            style={{
              fontSize: "75px",
              fontWeight: "700",
              fontFamily: "sans-serif",
              fill: "#ffffff",
            }}
          >
            {donorCount}
          </text>
          <text
            x={x - 31}
            y={y + 40}
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
