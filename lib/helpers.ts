import sdk from "@farcaster/miniapp-sdk";
import { FEATURED_POOL_NETWORK } from "./constants";

export const openExplorerUrl = (hash: string) => {
  if (!FEATURED_POOL_NETWORK) return;
  sdk.actions.openUrl(`${FEATURED_POOL_NETWORK.blockExplorer}tx/${hash}`);
};

export const openUrl = (url: string) => {
  sdk.actions.openUrl(url);
};

export const shareContent = (poolKey: string): string => {
  if (poolKey === "8453-32") {
    return `Streaming tips?! I'm supporting Cracked Farcaster Devs with a real-time token stream on @flowstatecoop. \n\nInstant + Consistent Funding = More Builders Building`;
  }
  //   if (poolKey === "42161-6") {
  //     return `Arbitrum’s top mini app builders now earn by the second 💸🌊.

  // @arbitrum, @flowstate, & @superfluid are teaming up for S2 of Flow Caster:
  // - 🤝 Dynamic scoring based on daily & transacting users
  // - 🐳 60k $USND sponsor funding
  // - 📈 3M+ $SUP incentives
  // - 🤑 ??? crowdsourced funding
  // `;
  //   }

  if (poolKey === "42161-6") {
    return `The top mini app builders on @arbitrum now earn by the second on @flowstatecoop's newest Flow Caster campaign 💸🌊: 
    
- 🤑 Dynamic, continuous funding based on weekly mini app rankings 
- 📈 3M+ @superfluid $SUP token incentives
- 🤝 ??? crowdsourced funding
`;
  }
  return "Instant + Consistent Funding. Real-time token stream on @flowstatecoop";
};
