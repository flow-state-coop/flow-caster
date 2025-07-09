"use client";
import { useMiniApp } from "@/contexts/miniapp-context";
import PoolCircle from "@/components/Pool/PoolCircle";

export default function Home() {
  const { context } = useMiniApp();

  console.log("context", context);

  return (
    <main className="p-4">
      <h1 className="text-5xl mb-4 font-header text-secondary-800">
        Flow Splitter
      </h1>

      {context && <p className="text-xs">{context.user.displayName}</p>}
      <PoolCircle />
    </main>
  );
}
