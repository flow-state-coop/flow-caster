/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Info, Share, House } from "lucide-react";
import { sdk } from "@farcaster/miniapp-sdk";
import { usePoolUser } from "@/contexts/pool-user-context";
import { ratePerMonthFormatted } from "@/lib/pool";
import InfoDrawer from "../Pool/InfoDrawer";
import OpenStream from "../Pool/OpenStream";
import ConnectPool from "../Pool/ConnectPool";
import ClaimSup from "../Pool/ClaimSup";
import BaseButton from "./BaseButton";

interface FooterProps {
  chainId: string;
  poolId: string;
  poolAddress: string;
  totalFlow: string | number;
  activeMemberCount?: number;
}
type DrawerTypes = "stream" | "claim" | "info" | "connect" | "edit";

export default function Footer({
  chainId,
  poolId,
  poolAddress,
  totalFlow,
  activeMemberCount,
}: FooterProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<DrawerTypes | undefined>();

  const {
    shouldConnect,
    connectedAddressNotPoolAddress,
    connectedDonor,
    connectedMember,
    noUnits,
  } = usePoolUser();

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
    setDrawerType(undefined);
  };

  const handleCast = async () => {
    await sdk.actions.composeCast({
      text: `Streaming tips?! Open a real-time stream split to ${
        activeMemberCount ? activeMemberCount : ""
      } Cracked Farcaster Devs with @flowstatecoop. \n\nInstant + Consistent Funding = More Builders Building`,
      embeds: [
        `${
          process.env.NEXT_PUBLIC_URL
        }/pool/${chainId}/${poolId}?totalFlow=${ratePerMonthFormatted(
          totalFlow
        )}`,
      ],
    });
  };

  const isLeaderboard = pathname.includes("leaderboard");

  return (
    <>
      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-primary-500 px-4 py-3 z-50">
        <div className="flex items-center justify-between w-full">
          {/* Buttons */}
          <div className="flex gap-3 text-black">
            <BaseButton
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
            </BaseButton>
          </div>

          {/* Links */}
          <div className="flex items-center">
            {!isLeaderboard && (
              <Link
                href={`/pool/${chainId}/${poolId}/leaderboard`}
                className="p-2 text-black hover:text-gray-800"
              >
                <Award size={20} />
              </Link>
            )}

            {isLeaderboard && (
              <Link
                href={`/pool/${chainId}/${poolId}`}
                className="p-2 text-black hover:text-gray-800"
              >
                <House size={20} />
              </Link>
            )}
            <button
              className="p-2 text-black hover:text-gray-800"
              onClick={() => handleOpenDrawer("claim")}
            >
              <div className="flex flex-row items-center gap-1 text-brand-sfGreen font-bold">
                <img
                  src="/images/sup.svg"
                  alt="Farcaster"
                  className="w-5 h-5"
                />
              </div>
            </button>

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
          {/* Drawer Content */}
          {drawerType === "stream" || drawerType === "edit" ? (
            <OpenStream
              chainId={chainId}
              poolId={poolId}
              poolAddress={poolAddress}
              connectedDonor={connectedDonor}
              handleCloseDrawer={handleCloseDrawer}
              isOpen={isDrawerOpen}
              activeMemberCount={activeMemberCount}
            />
          ) : null}
          {drawerType === "claim" && (
            <ClaimSup handleCloseDrawer={handleCloseDrawer} />
          )}
          {drawerType === "info" && (
            <InfoDrawer
              handleCloseDrawer={handleCloseDrawer}
              activeMemberCount={activeMemberCount}
            />
          )}
          {drawerType === "connect" && connectedMember && (
            <ConnectPool
              poolAddress={poolAddress}
              poolId={poolId}
              chainId={chainId}
              connectedAddressNotPoolAddress={connectedAddressNotPoolAddress}
              connectedMember={connectedMember}
              handleCloseDrawer={handleCloseDrawer}
              noUnits={noUnits}
              shouldConnect={!connectedMember.isConnected}
            />
          )}
        </div>
      </div>
    </>
  );
}
