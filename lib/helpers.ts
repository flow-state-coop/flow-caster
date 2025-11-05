import sdk from "@farcaster/miniapp-sdk";
import { FEATURED_POOL_NETWORK } from "./constants";

export const openExplorerUrl = (hash: string) => {
  sdk.actions.openUrl(`${FEATURED_POOL_NETWORK}tx/${hash}`);
};

export const openUrl = (url: string) => {
  sdk.actions.openUrl(url);
};

export const shareContent = (poolKey: string): string => {
  if (poolKey === "8453-32") {
    return `Streaming tips?! I'm supporting Cracked Farcaster Devs with a real-time token stream on @flowstatecoop. \n\nInstant + Consistent Funding = More Builders Building`;
  }
  if (poolKey === "11155420-96") {
    return `Arbitrum’s top mini app builders now earn by the second 💸🌊. 
    
@arbitrum, @flowstate, & @superfluid are teaming up for S2 of Flow Caster:
- 🤝Dynamic scoring based on daily & transacting users
- 🐳60k $USND sponsor funding
- 📈2M $SUP incentives
- 🤑??? crowdsourced funding 
`;
  }
  return "Instant + Consistent Funding. Real-time token stream on @flowstatecoop";
};
