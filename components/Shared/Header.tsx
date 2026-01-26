/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import PoolSwitcher from "./PoolSwitcher";
import { usePool } from "@/contexts/pool-context";
import { usePathname } from "next/navigation";
import { NETWORK_ICONS } from "@/lib/constants";

export default function Header() {
  const { getCurrentPoolData } = usePool();
  const currentPoolData = getCurrentPoolData();
  const pathname = usePathname();

  const hideSwitcher = pathname.includes("wallet");

  return (
    <div className="flex items-center justify-between mt-2">
      <div>{!hideSwitcher && <PoolSwitcher />}</div>
      {NETWORK_ICONS[
        currentPoolData.DEFAULT_CHAIN_ID as keyof typeof NETWORK_ICONS
      ] && (
        <img
          src={
            NETWORK_ICONS[
              currentPoolData.DEFAULT_CHAIN_ID as keyof typeof NETWORK_ICONS
            ]
          }
          alt="network logo"
          className="w-8 h-8"
        />
      )}
    </div>
  );
}
