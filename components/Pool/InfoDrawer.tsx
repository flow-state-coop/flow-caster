"use client";
import { sdk } from "@farcaster/miniapp-sdk";
import { X } from "lucide-react";
import { DrawerTypes } from "../Shared/Footer";

interface InfoDrawerProps {
  handleCloseDrawer: () => void;
  handleOpenDrawer: (types: DrawerTypes) => void;
  activeMemberCount?: number;
  poolKey: string;
}

export default function InfoDrawer({
  handleCloseDrawer,
  handleOpenDrawer,
  activeMemberCount,
  poolKey,
}: InfoDrawerProps) {
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
        {poolKey === "8453-32" && (
          <CrackedInfo
            activeMemberCount={activeMemberCount}
            handleCloseDrawer={handleCloseDrawer}
            handleOpenDrawer={handleOpenDrawer}
            poolKey={poolKey}
          />
        )}
        {poolKey === "42161-96" && (
          <ArbInfo
            activeMemberCount={activeMemberCount}
            handleCloseDrawer={handleCloseDrawer}
            handleOpenDrawer={handleOpenDrawer}
            poolKey={poolKey}
          />
        )}
      </div>
    </>
  );
}

function CrackedInfo({ activeMemberCount }: InfoDrawerProps) {
  const handleViewProfile = async () => {
    await sdk.actions.viewCast({
      hash: "0xcd9b0113",
    });
  };
  return (
    <>
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
    </>
  );
}

function ArbInfo({ handleOpenDrawer }: InfoDrawerProps) {
  const onClaimSup = async () => {
    await sdk.actions.openMiniApp({
      url: "https://farcaster.xyz/miniapps/1NTJKdUZCsPI/superfluid-claim-app",
    });
  };

  return (
    <>
      <p>
        Flow Caster scores Arbitrum’s top mini apps and assigns shares in a
        dynamic streaming funding pool.
      </p>
      <p>Builders get paid every second instead of weekly.</p>
      <p>
        The campaign is supported by the Arbitrum Foundation (60k USND over 6
        months), Superfluid DAO{" "}
        <span
          onClick={onClaimSup}
          className="underline text-primary-900 font-bold hover:cursor-pointer hover:text-primary-600"
        >
          (3M+ SUP in incentives)
        </span>
        , &{" "}
        <span
          onClick={() => handleOpenDrawer("stream")}
          className="underline text-primary-900 font-bold hover:cursor-pointer hover:text-primary-600"
        >
          community donors like you.
        </span>
      </p>
    </>
  );
}
