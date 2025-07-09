"use client";

import { MiniAppProvider } from "@/contexts/miniapp-context";
import { UserProvider } from "@/contexts/user-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MiniAppProvider addMiniAppOnLoad={true}>
      <UserProvider autoSignIn={false}>{children}</UserProvider>
    </MiniAppProvider>
  );
}
