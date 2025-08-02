import { Token } from "./flowapp/networks";

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

export const FLUID_LOCKER_CONTRACT =
  "0xA6694cAB43713287F7735dADc940b555db9d39D9";
export const DEV_POOL_ADDRESS = "0x592834dfaa81dc050dc5ac46f4fc87d594faeb75";
// export const DEV_POOL_ADDRESS = "0x6719cbb70d0faa041f1056542af66066e3cc7a24";

export const DEV_POOL_ID = "73";
// export const DEV_POOL_ID = "32";

export const VIZ_PAUSED = true;
export const DEFAULT_CHAIN_ID = "11155420";
// export const DEFAULT_CHAIN_ID = "8453";

export const DEFAULT_POOL_ID = "71";
// export const DEFAULT_POOL_ID = "32";

export const SUP_PROGRAM_ID = 7742;
// export const SUP_PROGRAM_ID = 7743;

// "Update to the production config:
// - Cracked Devs: 0x9ef9fe8bf503b10698322e3a135c0fa6decc5b5b / https://flowstate.network/flow-splitters/8453/32
// - Team Split: 0x6719cbb70d0faa041f1056542af66066e3cc7a24 / https://flowstate.network/flow-splitters/8453/30
// - Base USDCx Token Info: https://explorer.superfluid.org/base-mainnet/supertokens/0xd04383398dd2426297da660f9cca3d439af9ce1b?tab=streams
// - SUP Program ID: 7743"
