/* eslint-disable @next/next/no-img-element */
"use client";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { NeynarUser } from "@/hooks/use-pool-data";

interface DonorNodeProps {
  x: number;
  y: number;
  radius?: number;
  accountId: string;
  farcasterUser?: NeynarUser | null;
}

export default function DonorNode({
  x,
  y,
  radius = 18,
  accountId,
  farcasterUser,
}: DonorNodeProps) {
  return (
    <Tippy
      content={
        <div className="text-xs p-2">
          {farcasterUser ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={farcasterUser.pfp_url}
                  alt={farcasterUser.display_name}
                  className="w-6 h-6 rounded-full"
                />
                <div>
                  <div className="font-bold">{farcasterUser.display_name}</div>
                  <div className="text-gray-400">@{farcasterUser.username}</div>
                </div>
              </div>
            </>
          ) : (
            <div>
              <b>Account:</b> {accountId}
            </div>
          )}
        </div>
      }
      trigger="click"
      interactive={true}
      placement="top"
      appendTo={document.body}
    >
      <g>
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
          className="opacity-90 hover:opacity-100 transition-opacity cursor-pointer stroke-secondary-800 fill-secondary-800"
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
            className="cursor-pointer"
            preserveAspectRatio="xMidYMid slice"
          />
        )}
      </g>
    </Tippy>
  );
}
