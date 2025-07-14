/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, ReactNode } from "react";
import { Award, Badge, Info, X } from "lucide-react";
import Link from "next/link";
import InfoDrawer from "../Pool/InfoDrawer";

interface LeaderActionsProps {
  chainId: string;
  poolId: string;
}

const drawerTitles = {
  stream: "Open Stream",
  claim: "Claim SUP",
  info: "About This Pool",
};

export default function LeaderActions({ chainId, poolId }: LeaderActionsProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"stream" | "claim" | "info">(
    "stream"
  );
  const handleOpenDrawer = (type: "stream" | "claim" | "info") => {
    setDrawerType(type);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
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
              className="p-2 text-black"
            >
              <Badge size={20} />
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
          {drawerType === "info" && <InfoDrawer />}
        </div>
      </div>
    </>
  );
}
