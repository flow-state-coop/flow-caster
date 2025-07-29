/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Badge, Info, Share, X } from "lucide-react";
import Link from "next/link";
import InfoDrawer from "../Pool/InfoDrawer";
import { ratePerMonthFormatted } from "@/lib/pool";

interface LeaderActionsProps {
  chainId: string;
  poolId: string;
  totalFlow: string | number;
}

const drawerTitles = {
  stream: "Open Stream",
  claim: "Claim SUP",
  info: "What is this?",
};

export default function LeaderActions({
  chainId,
  poolId,
  totalFlow,
}: LeaderActionsProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"stream" | "claim" | "info">(
    "info"
  );
  const handleOpenDrawer = (type: "stream" | "claim" | "info") => {
    setDrawerType(type);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleCast = async () => {
    await sdk.actions.composeCast({
      text: `Forget weekly tips. Open a real-time stream split to 78 Cracked Farcaster Devs with @flowstatecoop. \n Instant + Consistent Funding = More Builders Building`,
      embeds: [
        `${
          process.env.NEXT_PUBLIC_URL
        }/pool/${chainId}/${poolId}?totalFlow=${ratePerMonthFormatted(
          totalFlow
        )}`,
      ],
    });
  };

  return (
    <>
      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-primary-500 px-4 py-3 z-50">
        <div className="flex items-center justify-end w-full">
          {/* Links */}
          <div className="flex items-center">
            <Link
              href={`/pool/${chainId}/${poolId}`}
              className="flex flex-row items-center gap-1 p-2 text-black text-xs font-bold"
            >
              Back to <Badge size={20} />
            </Link>
            <div
              className="p-2 text-black hover:text-gray-800 hover:cursor-pointer"
              onClick={handleCast}
            >
              <Share size={20} />
            </div>
            <button
              className="p-2 text-black"
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
          {drawerType === "info" && <InfoDrawer />}
        </div>
      </div>
    </>
  );
}
