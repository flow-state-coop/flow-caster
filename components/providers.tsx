"use client";

import { MiniAppProvider } from "@/contexts/miniapp-context";
import { UserProvider } from "@/contexts/user-context";
import { PoolProvider } from "@/contexts/pool-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MiniAppProvider addMiniAppOnLoad={true}>
      <UserProvider autoSignIn={true}>
        <PoolProvider>{children}</PoolProvider>
      </UserProvider>
    </MiniAppProvider>
  );
}
