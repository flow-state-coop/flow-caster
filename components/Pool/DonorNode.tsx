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
  isGroupDonors: boolean;
}

export default function DonorNode({
  x,
  y,
  radius = 18,
  accountId,
  rate,
  farcasterUser,
  index,
  isGroupDonors,
}: DonorNodeProps) {
  const iconPath = isGroupDonors
    ? "/images/badge.svg"
    : "/images/user-circle.svg";

  return (
    <g key={index}>
      {/* Profile image as a clip path */}
      <defs>
        <clipPath id={`donor-clip-${accountId}`}>
          <circle cx={x} cy={y} r={radius} />
        </clipPath>
      </defs>

      {/* Background circle */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        strokeWidth="2"
        className="opacity-90 stroke-primary-500 fill-primary-500"
      />

      {/* Profile image */}
      <image
        href={farcasterUser?.pfp_url || iconPath}
        x={x - radius}
        y={y - radius}
        width={radius * 2}
        height={radius * 2}
        clipPath={`url(#donor-clip-${accountId})`}
        preserveAspectRatio="xMidYMid slice"
      />
    </g>
  );
}
