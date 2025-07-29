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
  const iconPath = "/images/user-circle.svg";

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
        className="stroke-primary-500 fill-primary-500"
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
            }}
          >
            {donorCount}
          </text>
          <text x={x - 30} y={y + 40} className="text-xl">
            donors
          </text>
        </>
      )}
    </g>
  );
}
