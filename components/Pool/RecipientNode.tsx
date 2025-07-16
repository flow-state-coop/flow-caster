/* eslint-disable @next/next/no-img-element */
"use client";
import { useRef, useEffect, useState } from "react";
import { NeynarUser } from "@/lib/neynar";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import gsap from "gsap";
import { ArrowRight, CircleArrowRight } from "lucide-react";
import {
  displayIndividualFlowPercentage,
  displayIndividualFlowRate,
  getMemberFlowRate,
} from "@/lib/pool";
import useFlowingAmount from "@/hooks/use-flowing-amount";
import FlowAmount from "./FlowAmount";

interface RecipientNodeProps {
  x: number;
  y: number;
  radius: number;
  accountId: string;
  units: number;
  totalUnits: number;
  totalFlowRate: number;
  totalFlowed: string;
  updatedAt: string;
  farcasterUser?: NeynarUser | null;
  startingAmount: string;
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
  updatedAt,
  startingAmount,
}: RecipientNodeProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const circleImgRef = useRef<SVGImageElement>(null);
  const [showing, setShowing] = useState(false);

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
              <b>Account:</b> {accountId}
            </div>
          )}

          <div className="font-bold text-xl text-accent-800 leading-tight">
            {displayIndividualFlowPercentage(totalUnits, units)} %{" "}
            <span className="text-sm text-black font-semibold">of pool</span>
          </div>

          <div className="font-bold text-xl text-accent-800 leading-tight">
            {displayIndividualFlowRate(totalUnits, units, totalFlowRate)}{" "}
            <span className="text-xs text-black font-semibold">USDCx / mo</span>
          </div>
          <div className="font-bold text-xs text-accent-800"></div>

          <button className="flex flew-row items-center gap-1 mt-3 px-2 py-1 text-xs rounded-sm bg-brand-light text-black border border-black rounded-sm">
            Profile <CircleArrowRight />
          </button>
        </div>
      }
      trigger="click"
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
