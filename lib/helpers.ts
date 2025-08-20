import sdk from "@farcaster/miniapp-sdk";

export const openExplorerUrl = (hash: string) => {
  sdk.actions.openUrl(`https://basescan.org/tx/${hash}`);
};

export const openUrl = (url: string) => {
  sdk.actions.openUrl(url);
};
