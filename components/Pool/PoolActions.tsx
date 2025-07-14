/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, ReactNode } from "react";
import { Award, Info, X } from "lucide-react";
import InfoDrawer from "./InfoDrawer";
import OpenStream from "./OpenStream";
import ClaimSup from "./ClaimSup";
import Link from "next/link";

interface PoolActionsProps {
  onOpenStream: () => void;
  onClaimSup?: () => void;
  chainId: string;
  poolId: string;
}

const drawerTitles = {
  stream: "Open Stream",
  claim: "Claim SUP",
  info: "About This Pool",
};

export default function PoolActions({
  onOpenStream,
  onClaimSup,
  chainId,
  poolId,
}: PoolActionsProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"stream" | "claim" | "info">(
    "stream"
  );

  const handleOpenDrawer = (type: "stream" | "claim" | "info") => {
    setDrawerType(type);
    setIsDrawerOpen(true);
    if (type === "stream") {
      onOpenStream();
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-primary-500 px-4 py-3 z-50">
        <div className="flex items-center justify-between w-full">
          {/* Buttons */}
          <div className="flex gap-3 text-black">
            <button
              className="px-4 py-2 rounded-lg bg-brand-light text-lg font-bold border-2 border-black"
              onClick={() => handleOpenDrawer("stream")}
            >
              Open Stream
            </button>
            {/* <button
              className="px-4 py-2 rounded-lg bg-brand-light text-sm font-bold border-2 border-black"
              onClick={() => handleOpenDrawer("claim")}
            >
              Claim SUP
            </button> */}
          </div>

          {/* Links */}
          <div className="flex items-center">
            <a
              href="https://claim.superfluid.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-black text-xs"
            >
              <button className="flex flex-row items-center gap-1  px-2 py-1 rounded-lg border border-brand-sfGreen bg-brand-light">
                Claim
                <img
                  src="/images/sup.svg"
                  alt="Farcaster"
                  className="w-6 h-6"
                />
              </button>
            </a>
            <Link
              href={`/pool/${chainId}/${poolId}/leaderboard`}
              className="p-2 text-black"
            >
              <Award size={20} />
            </Link>
            <button
              className="p-2 text-black"
              onClick={() => handleOpenDrawer("info")}
            >
              <Info size={20} />
            </button>
            <a
              href="https://flowstate.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-black"
            >
              <img
                src="/images/fs-logo-circle-black.svg"
                alt="Farcaster"
                className="w-6 h-6"
              />
            </a>
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
            <h2 className="text-xl font-semibold text-gray-900">
              {drawerTitles[drawerType]}
            </h2>
            <button
              onClick={handleCloseDrawer}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Content */}
          {drawerType === "stream" && (
            <OpenStream onOpenStream={onOpenStream} />
          )}
          {/* {drawerType === "claim" && <ClaimSup onClaimSup={onClaimSup} />} */}
          {drawerType === "info" && <InfoDrawer />}
        </div>
      </div>
    </>
  );
}
