import { base, Chain, optimismSepolia } from "wagmi/chains";
import { networks } from "./flowapp/networks";

export const MESSAGE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 day

export const TOKEN_METADATA = {
  "0xD04383398dD2426297da660F9CCA3d439AF9ce1b": {
    icon: "/usdc.png",
  },
  "0xD6FAF98BeFA647403cc56bDB598690660D5257d2": {
    icon: "/dai.png",
  },
  "0x4ecf61a6c2fab8a047ceb3b3b263b401763e9d49": {
    icon: "/usnd.png",
  },
};

export const DEV_DONATION_PERCENT = 5;
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const FLUID_LOCKER_CONTRACT =
  "0xA6694cAB43713287F7735dADc940b555db9d39D9";

// export const FEATURED_NETWORK_ID = "8453";
// export const FEATURED_POOL_ID = "32";
export const FEATURED_NETWORK_ID = "11155420";
export const FEATURED_POOL_ID = "96";
export const FEATURED_TOKEN_SYMBOL = "$USND";

type POOL_CONFIG = {
  DEFAULT_CHAIN_ID: string;
  DEV_POOL_ADDRESS: string;
  DEV_POOL_ID: string;
  DEFAULT_POOL_ID: string;
  SUP_PROGRAM_ID: number;
  VIEM_CHAIN_OBJ: Chain;
  CONTENT: {
    NAME: string;
    DESCRIPTION?: string;
    POOL_TITLE: string;
    LOGO?: string;
  };
  FILTER_ZERO_UNITS: boolean;
  IS_CRACKED?: boolean;
  IS_ARB?: boolean;
  SUP_REWARDS?: boolean;
  SPONSOR_ADDRESS?: string;
  SPONSOR_ICON?: string;
};

export const FEATURED_POOLS: Record<string, POOL_CONFIG> = {
  // cracked devs
  "8453-32": {
    DEFAULT_CHAIN_ID: "8453",
    DEV_POOL_ADDRESS: "0x6719cbb70d0faa041f1056542af66066e3cc7a24",
    DEV_POOL_ID: "30",
    DEFAULT_POOL_ID: "32",
    SUP_PROGRAM_ID: 7743,
    VIEM_CHAIN_OBJ: base,
    CONTENT: {
      NAME: "Cracked Farcaster Devs",
      POOL_TITLE: "Cracked Farcaster Devs",
    },
    FILTER_ZERO_UNITS: true,
    IS_CRACKED: true,
    SUP_REWARDS: false,
  },
  // sep arb devs
  "11155420-96": {
    DEFAULT_CHAIN_ID: "11155420",
    DEV_POOL_ADDRESS: "0xb5cb850de58ff3fb199b72bbb235b46dd314c0fd",
    DEV_POOL_ID: "97",
    DEFAULT_POOL_ID: "96",
    SUP_PROGRAM_ID: 7742,
    VIEM_CHAIN_OBJ: optimismSepolia,
    CONTENT: {
      NAME: "Arbitrum Mini App Rewards",
      DESCRIPTION: "Continuous rewards for Arbitrum's top mini apps",
      POOL_TITLE: "Sponsored by the Arbitrum Foundation",
      LOGO: "/images/arb-logo.svg",
    },
    FILTER_ZERO_UNITS: false,
    SUP_REWARDS: true,
    SPONSOR_ADDRESS: "0xed6a062fbe2993be323af118f79e9b213c81f4f2",
    SPONSOR_ICON: "/images/arb-logo.svg",
    IS_ARB: true,
  },
};

export const NERITE_TOKEN_ID = `eip155:42161/erc20:0x4ecf61a6c2fab8a047ceb3b3b263b401763e9d49`;

export const TARGET_CHAIN_OBJS = Object.keys(FEATURED_POOLS).map(
  (k) => FEATURED_POOLS[k].VIEM_CHAIN_OBJ
);

export const FEATURED_POOL_DATA =
  FEATURED_POOLS[`${FEATURED_NETWORK_ID}-${FEATURED_POOL_ID}`];

export const FEATURED_POOL_NETWORK = networks.find(
  (network) => network.id === Number(FEATURED_NETWORK_ID)
);

export const VIZ_PAUSED = true;
