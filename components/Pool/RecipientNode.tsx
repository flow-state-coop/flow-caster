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
}

export default function RecipientNode({
  x,
  y,
  radius,
  accountId,
  units,
  totalUnits,
  recipientCount,
}: RecipientNodeProps) {
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!circleRef.current) return;

    // Gentle wiggle animation
    gsap.to(circleRef.current, {
      x: "random(-2, 1.5)",
      y: "random(-2, 1.5)",
      duration: "random(1.5, 2.5)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Subtle scale pulse for both glow and main circle
    // gsap.to([glowRef.current, circleRef.current], {
    gsap.to([circleRef.current], {
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
        <div className="text-xs p-2">
          <div>
            <b>Account:</b> {accountId}
          </div>
          <div>
            <b>Units:</b> {units}
          </div>
        </div>
      }
      trigger="click"
      interactive={true}
      placement="top"
      appendTo={document.body}
    >
      <g>
        <circle
          ref={circleRef}
          cx={x}
          cy={y}
          r={radius}
          strokeWidth="2"
          className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer stroke-primary-400 fill-primary-400"
          filter="drop-shadow(0 0 6px #1a5d6b)"
        />
      </g>
    </Tippy>
  );
}
