"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { sdk } from "@farcaster/miniapp-sdk";
import Tippy from "@tippyjs/react";
import { useAccountSup } from "@/hooks/use-account-sup";
import { ratePerMonthFormatted, ratePerWeekFormatted } from "@/lib/pool";
import "tippy.js/dist/tippy.css";

interface SupRewardNodeProps {
  x: number;
  y: number;
  radius?: number;
}

export default function SupRewardNode({
  x,
  y,
  radius = 40,
}: SupRewardNodeProps) {
  const [showing, setShowing] = useState(false);
  const { address } = useAccount();
  const { data } = useAccountSup({
    userAddress: address,
  });

  const onClaimSup = async () => {
    await sdk.actions.openMiniApp({
      url: "https://farcaster.xyz/miniapps/1NTJKdUZCsPI/superfluid-claim-app",
    });
  };

  return (
    <Tippy
      content={
        <div className="text-xs p-4">
          <div className="font-bold text-accent-800 text-lg mb-2">
            Support Devs, Earn SUP
          </div>
          <div className="text-base font-bold text-primary-500 mb-4">
            125K $SUP/mo is up for grabs. Earn XP for every 1 USND streamed.
          </div>
          {data && (
            <div className="flex flex-col items-center w-full gap-1 mb-4">
              <p className="font-bold text-black">Your Rewards Rate</p>
              <div className="text-2xl font-bold text-brand-sfGreen">
                {/* {`${ratePerMonthFormatted(data.flowRate)} SUP / mo`} */}

                <div>{`${ratePerWeekFormatted(data.flowRate)} SUP / week`}</div>
              </div>
            </div>
          )}
          <button
            onClick={onClaimSup}
            className="w-full py-2 px-4 bg-brand-sfGreen hover:bg-brand-sfGreen/80 text-white font-bold rounded-lg transition-colors"
          >
            Claim SUP XP Daily
          </button>
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
        <defs>
          <clipPath id="sup-reward-clip">
            <circle cx={x} cy={y} r={radius} />
          </clipPath>
        </defs>

        {/* Background circle with green glow */}
        <circle
          cx={x}
          cy={y}
          r={radius}
          strokeWidth="3"
          stroke="#75eb00"
          fill="#1a1a1a"
          filter="drop-shadow(0 0 8px #75eb00)"
          className="cursor-pointer hover:opacity-90 transition-opacity"
        />

        {/* SUP icon image */}
        <image
          href="/images/SUP_flat_400x400.png"
          x={x - radius}
          y={y - radius}
          width={radius * 2}
          height={radius * 2}
          clipPath="url(#sup-reward-clip)"
          preserveAspectRatio="xMidYMid slice"
          className="cursor-pointer"
        />
      </g>
    </Tippy>
  );
}
