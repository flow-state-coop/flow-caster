/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import PoolSwitcher from "./PoolSwitcher";
import { usePool } from "@/contexts/pool-context";

export default function Header() {
  const { getCurrentPoolData } = usePool();
  const currentPoolData = getCurrentPoolData();

  return (
    <div>
      <div className="flex flex-row items-center justify-between w-full mb-1">
        <div className="flex flex-row items-center gap-1">
          <Image src="/images/icon.png" width={30} height={30} alt="logo" />
          <h1 className="text-xl font-header text-black tracking-tight">
            flowcaster
          </h1>
        </div>
      </div>
      <div className="mt-2">
        <PoolSwitcher />
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
