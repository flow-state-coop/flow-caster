import { farcasterFrame as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { FEATURED_POOL_DATA } from "@/lib/constants";

export const config = createConfig({
  chains: [FEATURED_POOL_DATA.VIEM_CHAIN_OBJ],
  transports: {
    [FEATURED_POOL_DATA.VIEM_CHAIN_OBJ.id]: http(),
  },
  connectors: [miniAppConnector()],
});

const queryClient = new QueryClient();

export default function MiniAppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
