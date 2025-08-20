import { base, optimismSepolia } from "wagmi/chains";
import { Token } from "./flowapp/networks";
import { AppPoolMeta } from "./types";

export const MESSAGE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 day

export const TOKEN_DATA: Record<
  string,
  Token & {
    underlyingAddress: string;
    underlyingSymbol: string;
    underlyingDecimals: number;
  }
> = {
  "8453": {
    symbol: "USDCx",
    address: "0xD04383398dD2426297da660F9CCA3d439AF9ce1b",
    icon: "/usdc.png",
    underlyingAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    underlyingSymbol: "USDC",
    underlyingDecimals: 6,
  },
  "11155420": {
    symbol: "fDAIx",
    address: "0xD6FAF98BeFA647403cc56bDB598690660D5257d2",
    icon: "/dai.png",
    underlyingAddress: "0x4247bA6C3658Fa5C0F523BAcea8D0b97aF1a175e",
    underlyingSymbol: "fDAI",
    underlyingDecimals: 18,
  },
};

export const DEV_DONATION_PERCENT = 5;
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const FLUID_LOCKER_CONTRACT =
  "0xA6694cAB43713287F7735dADc940b555db9d39D9";

export const TARGET_NETWORK_ID = "8453";
// export const TARGET_NETWORK_ID = "11155420";

const FEATURED_POOLS = {
  "8453": {
    DEV_POOL_ADDRESS: "0x6719cbb70d0faa041f1056542af66066e3cc7a24",
    DEFAULT_CHAIN_ID: "8453",
    DEV_POOL_ID: "30",
    DEFAULT_POOL_ID: "32",
    SUP_PROGRAM_ID: 7743,
    VIEM_CHAIN_OBJ: base,
  },
  "11155420": {
    DEV_POOL_ADDRESS: "0x592834dfaa81dc050dc5ac46f4fc87d594faeb75",
    DEFAULT_CHAIN_ID: "11155420",
    DEV_POOL_ID: "73",
    DEFAULT_POOL_ID: "71",
    SUP_PROGRAM_ID: 7742,
    VIEM_CHAIN_OBJ: optimismSepolia,
  },
};

export const FEATURED_POOL_DATA = FEATURED_POOLS[TARGET_NETWORK_ID];
export const VIZ_PAUSED = true;

export const POOL_METADATA: Record<string, AppPoolMeta> = {
  "8453-32": {
    hasSupRewards: true,
    isCracked: true,
  },
  "11155420-71": {
    hasSupRewards: true,
    isCracked: true,
  },
};
