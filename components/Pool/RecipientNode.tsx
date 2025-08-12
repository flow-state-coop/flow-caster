/* eslint-disable @next/next/no-img-element */
"use client";
import { useRef, useState } from "react";
import { NeynarUser } from "@/lib/neynar";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { sdk } from "@farcaster/miniapp-sdk";
import { ArrowRight } from "lucide-react";
import {
  displayIndividualFlowPercentage,
  displayIndividualFlowRate,
  truncateAddress,
} from "@/lib/pool";

interface RecipientNodeProps {
  x: number;
  y: number;
  radius: number;
  accountId: string;
  units: number;
  totalUnits: number;
  totalFlowRate: number;
  farcasterUser?: NeynarUser | null | undefined;
  connected: boolean;
}

export default function RecipientNode({
  x,
  y,
  radius,
  accountId,
  units,
  totalUnits,
  totalFlowRate,
  farcasterUser,
  connected,
}: RecipientNodeProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const circleImgRef = useRef<SVGImageElement>(null);
  const [showing, setShowing] = useState(false);

  const handleViewProfile = async (fid: number) => {
    await sdk.actions.viewProfile({
      fid,
    });
  };

  return (
    <Tippy
      content={
        <div className="text-xs p-4">
          {farcasterUser ? (
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
          ) : (
            <div>
              <b>Account:</b> {truncateAddress(accountId)}
            </div>
          )}

          {units > 0 ? (
            <>
              <div className="font-bold text-xl text-accent-800 leading-tight mt-3">
                {displayIndividualFlowPercentage(totalUnits, units)} %{" "}
                <span className="text-sm text-black font-semibold">
                  of pool
                </span>
              </div>

              <div className="font-bold text-xl text-accent-800 leading-tight">
                {displayIndividualFlowRate(totalUnits, units, totalFlowRate)}{" "}
                <span className="text-xs text-black font-semibold">
                  USDCx / mo
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="text-xs text-black font-semibold mt-3">
                For sure cracked.
              </div>
              <div className="text-xs text-black font-semibold mt-1">
                Hasn&apos;t opted into funding yet.
              </div>
            </>
          )}

          {!connected && (
            <div className="text-[10px] text-black mt-2">Not connected</div>
          )}
          {connected && (
            <div className="text-[10px] text-black mt-2">Connected</div>
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
    >
      <g>
        {/* Profile image as a clip path */}
        {farcasterUser?.pfp_url && (
          <defs>
            <clipPath id={`recipient-clip-${accountId}`}>
              <circle cx={x} cy={y} r={radius} />
            </clipPath>
          </defs>
        )}

        {/* Background circle */}
        <circle
          ref={circleRef}
          cx={x}
          cy={y}
          r={radius}
          strokeWidth="2"
          className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer stroke-primary-400 fill-primary-400"
          filter="drop-shadow(0 0 6px #1a5d6b)"
        />

        {/* Profile image */}
        {farcasterUser?.pfp_url && (
          <image
            ref={circleImgRef}
            href={farcasterUser.pfp_url}
            x={x - radius}
            y={y - radius}
            width={radius * 2}
            height={radius * 2}
            clipPath={`url(#recipient-clip-${accountId})`}
            className="cursor-pointer"
          />
        )}
      </g>
    </Tippy>
  );
}
