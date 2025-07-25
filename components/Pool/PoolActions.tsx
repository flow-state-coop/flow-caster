/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import { Award, Info, Share, X } from "lucide-react";
import { sdk } from "@farcaster/miniapp-sdk";
import InfoDrawer from "./InfoDrawer";
import OpenStream from "./OpenStream";
import Link from "next/link";
import ConnectPool from "./ConnectPool";
import { PoolData } from "@/lib/types";
import { ratePerMonthFormatted } from "@/lib/pool";
import ClaimSup from "./ClaimSup";

interface PoolActionsProps {
  onOpenStream: () => void;
  onClaimSup?: () => void;
  chainId: string;
  poolId: string;
  shouldConnect?: boolean;
  poolAddress: string;
  connectedAddressNotPoolAddress: boolean;
  connectedMember?: PoolData["poolMembers"][0];
  totalFlow: string | number;
  connectedDonor?: PoolData["poolDistributors"][0];
}

type DrawerTypes = "stream" | "claim" | "info" | "connect" | "edit";

export default function PoolActions({
  chainId,
  poolId,
  shouldConnect,
  poolAddress,
  connectedAddressNotPoolAddress,
  connectedMember,
  totalFlow,
  connectedDonor,
}: PoolActionsProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<DrawerTypes>("info");

  useEffect(() => {
    if (shouldConnect) {
      setDrawerType("connect");
      setIsDrawerOpen(true);
    }
  }, [shouldConnect]);

  const handleOpenDrawer = (type: DrawerTypes) => {
    setDrawerType(type);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleCast = async () => {
    await sdk.actions.composeCast({
      text: "Support Cracked Farcaster Devs",
      embeds: [
        `${
          process.env.NEXT_PUBLIC_URL
        }/pool/${chainId}/${poolId}?totalFlow=${ratePerMonthFormatted(
          totalFlow
        )}`,
      ],
    });
  };

  const getDrawerTitle = () => {
    const drawerTitles = {
      stream: "Open Stream",
      claim: "SUP Rewards",
      info: "What is this?",
      connect: "You're getting paid",
      edit: "Edit Stream",
    };

    return drawerTitles[drawerType];
  };

  return (
    <>
      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-primary-500 px-4 py-3 z-50">
        <div className="flex items-center justify-between w-full">
          {/* Buttons */}
          <div className="flex gap-3 text-black">
            <button
              className="px-4 py-2 rounded-lg bg-brand-light text-base font-bold border-2 border-black"
              onClick={() =>
                handleOpenDrawer(
                  connectedDonor && Number(connectedDonor.flowRate) > 0
                    ? "edit"
                    : "stream"
                )
              }
            >
              {connectedDonor && Number(connectedDonor.flowRate) > 0
                ? "Edit"
                : "Open"}{" "}
              Stream
            </button>
          </div>

          {/* Links */}
          <div className="flex items-center">
            <button
              className="p-2 text-black hover:text-gray-800"
              onClick={() => handleOpenDrawer("claim")}
            >
              <div className="flex flex-row items-center gap-1 text-brand-sfGreen font-bold">
                <img
                  src="/images/sup.svg"
                  alt="Farcaster"
                  className="w-6 h-6"
                />
              </div>
            </button>
            <Link
              href={`/pool/${chainId}/${poolId}/leaderboard`}
              className="p-2 text-black hover:text-gray-800"
            >
              <Award size={20} />
            </Link>
            <div
              className="p-2 text-black hover:text-gray-800 hover:cursor-pointer"
              onClick={handleCast}
            >
              <Share size={20} />
            </div>
            <button
              className="p-2 text-black hover:text-gray-800"
              onClick={() => handleOpenDrawer("info")}
            >
              <Info size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={handleCloseDrawer}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-brand-light shadow-2xl transform transition-transform duration-300 z-50 ${
          isDrawerOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="p-6">
          {/* Drawer Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-accent-800">
              {getDrawerTitle()}
            </h2>
            <button
              onClick={handleCloseDrawer}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Content */}
          {drawerType === "stream" || drawerType === "edit" ? (
            <OpenStream
              chainId={chainId}
              poolId={poolId}
              poolAddress={poolAddress}
              connectedDonor={connectedDonor}
            />
          ) : null}
          {drawerType === "claim" && <ClaimSup />}
          {drawerType === "info" && <InfoDrawer />}
          {drawerType === "connect" && connectedMember && (
            <ConnectPool
              poolAddress={poolAddress}
              poolId={poolId}
              chainId={chainId}
              connectedAddressNotPoolAddress={connectedAddressNotPoolAddress}
              connectedMember={connectedMember}
            />
          )}
        </div>
      </div>
    </>
  );
}
