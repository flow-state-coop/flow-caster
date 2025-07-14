/* eslint-disable @next/next/no-img-element */
"use client";
import { useRef, useEffect } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import gsap from "gsap";

interface RecipientNodeProps {
  x: number;
  y: number;
  radius: number;
  accountId: string;
  units: number;
  totalUnits: number;
  recipientCount: number;
  farcasterUser?: NeynarUser | null;
}

export default function RecipientNode({
  x,
  y,
  radius,
  accountId,
  units,
  totalUnits,
  recipientCount,
  farcasterUser,
}: RecipientNodeProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const circleImgRef = useRef<SVGImageElement>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_VIS === "paused") return;
    if (!circleRef.current) return;

    // Gentle wiggle animation
    gsap.to([circleRef.current, circleImgRef.current], {
      x: "random(-2, 1.5)",
      y: "random(-2, 1.5)",
      duration: "random(1.5, 2.5)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Subtle scale pulse for both glow and main circle
    // gsap.to([glowRef.current, circleRef.current], {
    gsap.to([circleRef.current, circleImgRef.current], {
      scale: 1.1,
      duration: "random(2, 4)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Opacity pulse for the glow
    gsap.to(circleRef.current, {
      opacity: 0.6,
      duration: "random(2, 4)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, [circleRef]);

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
          <div className="font-bold text-lg">{units} % Split</div>
          <button className="px-2 py-1 text-xs rounded-sm bg-primary-800 text-white font-medium hover:bg-primary-700 transition-colors">
            Profile
          </button>
        </div>
      }
      trigger="click"
      interactive={true}
      placement="top"
      appendTo={document.body}
      theme="flow"
      className="bg-primary-400"
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
