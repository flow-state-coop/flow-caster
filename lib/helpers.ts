import sdk from "@farcaster/miniapp-sdk";
import { FEATURED_POOL_NETWORK } from "./constants";

export const openExplorerUrl = (hash: string) => {
  sdk.actions.openUrl(`${FEATURED_POOL_NETWORK}tx/${hash}`);
};

export const openUrl = (url: string) => {
  sdk.actions.openUrl(url);
};
