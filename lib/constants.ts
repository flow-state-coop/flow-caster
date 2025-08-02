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
export const DEV_POOL_ID = "73";
export const VIZ_PAUSED = true;
