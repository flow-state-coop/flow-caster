"use client";
import { sdk } from "@farcaster/miniapp-sdk";
import { X } from "lucide-react";

interface InfoProps {
  handleCloseDrawer: () => void;
  activeMemberCount?: number;
}

export default function InfoDrawer({
  handleCloseDrawer,
  activeMemberCount,
}: InfoProps) {
  const handleViewProfile = async () => {
    await sdk.actions.viewCast({
      hash: "0xcd9b0113",
    });
  };

  const onClaimSup = async () => {
    await sdk.actions.openMiniApp({
      url: "https://farcaster.xyz/miniapps/qva4-LdCMptX/sup",
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-accent-800">What is this?</h2>
        <button
          onClick={handleCloseDrawer}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="mb-6 flex flex-col gap-2 text-primary-800">
        <p>
          Open a token stream that&apos;s split in real-time to{" "}
          {activeMemberCount ? activeMemberCount : ""} cracked Farcaster devs{" "}
          <span
            onClick={handleViewProfile}
            className="underline text-primary-900 font-bold hover:cursor-pointer hover:text-primary-600"
          >
            (h/t @Curie curation).
          </span>
        </p>
        <p>
          Your stream delivers instant & consistent income so these builders can
          focus on building.
        </p>
        <p>
          Donors are eligible for{" "}
          <span
            onClick={onClaimSup}
            className="underline text-primary-900 font-bold hover:cursor-pointer hover:text-primary-600"
          >
            SUP Rewards.
          </span>
        </p>
      </div>
    </>
  );
}
