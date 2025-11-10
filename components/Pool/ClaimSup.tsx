"use client";

import { useAccount } from "wagmi";
import { X } from "lucide-react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccountSup } from "@/hooks/use-account-sup";
import { ratePerMonthFormatted } from "@/lib/pool";
import BaseButton from "../Shared/BaseButton";

interface ClaimSupProps {
  handleCloseDrawer: () => void;
}

export default function ClaimSup({ handleCloseDrawer }: ClaimSupProps) {
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
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-accent-800">
          Support Devs, Earn SUP
        </h2>
        <button
          onClick={handleCloseDrawer}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="mb-6">
        <p className="text-primary-500 text-sm">
          3M+ SUP is up for grabs—1 USND Streamed = 1 XP (updated nightly). Turn
          on app notifications for more ways to earn.
        </p>
      </div>

      {data && (
        <div className="flex flex-col items-center w-full gap-1 mb-6">
          <p className="font-bold text-black">Your Rewards Rate</p>
          <div className="text-2xl font-bold text-brand-sfGreen mb-5">
            <div>{`${ratePerMonthFormatted(data.flowRate)} SUP / mo`}</div>
          </div>
        </div>
      )}
      <BaseButton
        className="bg-brand-sfGreen hover:bg-brand-sfGreen/80"
        onClick={onClaimSup}
        type="button"
      >
        Claim SUP XP Daily
      </BaseButton>
    </>
  );
}
