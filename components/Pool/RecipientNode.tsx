"use client";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

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
          cx={x}
          cy={y}
          r={radius}
          strokeWidth="2"
          className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer stroke-secondary-800 fill-primary-800"
        />
      </g>
    </Tippy>
  );
}
