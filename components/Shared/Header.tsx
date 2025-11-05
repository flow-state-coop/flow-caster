/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import PoolSwitcher from "./PoolSwitcher";
import { usePool } from "@/contexts/pool-context";
import { usePathname } from "next/navigation";

export default function Header() {
  const { getCurrentPoolData } = usePool();
  const currentPoolData = getCurrentPoolData();
  const pathname = usePathname();

  const hideSwitcher = pathname.includes("wallet");

  return (
    <div>
      <div className="mt-2">
        {!hideSwitcher && <PoolSwitcher />}
        <div className="text-black text-xs w-full mt-1 flex gap-1">
          {currentPoolData.CONTENT.LOGO && (
            <img
              src={currentPoolData.CONTENT.LOGO}
              alt="logo"
              className="w-4 h-4 rounded-full"
            />
          )}
          {currentPoolData.CONTENT.DESCRIPTION}
        </div>
      </div>
    </div>
  );
}
