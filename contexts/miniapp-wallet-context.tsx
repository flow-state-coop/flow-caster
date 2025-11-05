import { farcasterFrame as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, injected, WagmiProvider } from "wagmi";
import { Chain } from "wagmi/chains";
import { TARGET_CHAIN_OBJS, FEATURED_POOLS } from "@/lib/constants";

export const config = createConfig({
  chains: TARGET_CHAIN_OBJS as [Chain, ...Chain[]],
  transports: {
    ...Object.keys(FEATURED_POOLS).reduce((acc, key) => {
      acc[FEATURED_POOLS[key].VIEM_CHAIN_OBJ.id] = http();
      return acc;
    }, {} as Record<number, any>),
  },
  connectors: [miniAppConnector()],
  // connectors: [injected()],
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
