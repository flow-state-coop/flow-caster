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
      <div className="mt-2">{!hideSwitcher && <PoolSwitcher />}</div>
    </div>
  );
}
