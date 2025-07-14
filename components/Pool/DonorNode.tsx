/* eslint-disable @next/next/no-img-element */
"use client";
import { NeynarUser } from "@/lib/neynar";
import { truncateAddress } from "@/lib/pool";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

interface DonorNodeProps {
  x: number;
  y: number;
  radius?: number;
  accountId?: string;
  rate: string;
  farcasterUser?: NeynarUser | null | undefined;
  index: number;
}

export default function DonorNode({
  x,
  y,
  radius = 18,
  accountId,
  rate,
  farcasterUser,
  index,
}: DonorNodeProps) {
  const isTotalBucket = !accountId || accountId.includes("Total");

  return (
    <g key={index}>
      {/* Profile image as a clip path */}
      {farcasterUser?.pfp_url && (
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
        className="opacity-90 stroke-primary-500 fill-primary-500"
      />

      {/* Profile image */}
      {farcasterUser?.pfp_url && (
        <image
          href={farcasterUser.pfp_url}
          x={x - radius}
          y={y - radius}
          width={radius * 2}
          height={radius * 2}
          clipPath={`url(#donor-clip-${accountId})`}
          preserveAspectRatio="xMidYMid slice"
        />
      )}
    </g>
  );
}
