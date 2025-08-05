import { DEFAULT_CHAIN_ID } from "@/lib/constants";
import { farcasterFrame as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { base, optimismSepolia } from "wagmi/chains";

export const config = createConfig({
  chains: DEFAULT_CHAIN_ID === "8453" ? [base] : [optimismSepolia],
  transports: {
    [base.id]: http("https://base.llamarpc.com"),
    [optimismSepolia.id]: http(),
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
