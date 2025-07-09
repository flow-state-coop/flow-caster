"use client";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

interface DonorNodeProps {
  x: number;
  y: number;
  radius?: number;
  accountId: string;
}

export default function DonorNode({
  x,
  y,
  radius = 18,
  accountId,
}: DonorNodeProps) {
  return (
    <Tippy
      content={
        <div className="text-xs p-2">
          <b>Account:</b> {accountId}
        </div>
      }
      trigger="click"
      interactive={true}
      placement="top"
      appendTo={document.body}
    >
      <g>
        <circle
          cx={x}
          cy={y}
          r={radius}
          strokeWidth="2"
          className="opacity-90 hover:opacity-100 transition-opacity cursor-pointer stroke-accent-800 fill-accent-200"
        />
      </g>
    </Tippy>
  );
}
