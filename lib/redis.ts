import { Redis } from "@upstash/redis";
import { env } from "process";
import type { NeynarUser } from "./neynar";

const NEYNAR_USER_PREFIX = "flowcaster:neynaruser:";
const TTL_SECONDS = 48 * 60 * 60;

const normalizeAddress = (address: string) => address.trim().toLowerCase();

type AddressUserPair = {
  address: string;
  user: NeynarUser;
};

if (!env.REDIS_URL || !env.REDIS_TOKEN) {
  console.warn(
    "REDIS_URL or REDIS_TOKEN environment variable is not defined, please add to enable background notifications and webhooks."
  );
}

export const redis =
  env.REDIS_URL && env.REDIS_TOKEN
    ? new Redis({
        url: env.REDIS_URL,
        token: env.REDIS_TOKEN,
      })
    : null;

export const getNeynarUserByAddresssByAddress = async (addresses: string[]) => {
  if (!addresses.length) return [];
  if (!redis) {
    return addresses.map(() => null);
  }

  const normalizedAddresses = addresses.map(normalizeAddress);
  const keys = normalizedAddresses.map(
    (address) => `${NEYNAR_USER_PREFIX}address:${address}`
  );

  // Don't pass generics — Upstash infers correctly.
  const values = await redis.mget(keys);

  return values as (NeynarUser | null)[];
};

const toAddressUserPair = (
  entry: NeynarUser | AddressUserPair
): AddressUserPair | null => {
  if ("user" in entry && "address" in entry) {
    if (!entry.address) return null;
    return {
      address: normalizeAddress(entry.address),
      user: entry.user,
    };
  }

  const { verified_addresses } = entry;
  const primaryAddress = verified_addresses?.primary?.eth_address;
  if (!primaryAddress) return null;

  return {
    address: normalizeAddress(primaryAddress),
    user: entry,
  };
};

export const setNeynarUserByAddresssByAddress = async (
  users: Array<NeynarUser | AddressUserPair>
) => {
  if (!redis) return;

  const pipeline = redis.pipeline();

  for (const entry of users) {
    const pair = toAddressUserPair(entry);
    if (!pair) continue;

    const key = `${NEYNAR_USER_PREFIX}address:${pair.address}`;
    pipeline.set(key, pair.user, { ex: TTL_SECONDS });
  }

  await pipeline.exec();
};

export const getNeynarUserByAddress = async (address: string) => {
  if (!redis) return null;

  const key = `${NEYNAR_USER_PREFIX}address:${normalizeAddress(address)}`;
  const data = await redis.get<NeynarUser>(key);

  return data ?? null;
};

export const setNeynarUserByAddress = async (
  address: string,
  user: NeynarUser
) => {
  if (!redis) return;

  const key = `${NEYNAR_USER_PREFIX}address:${normalizeAddress(address)}`;
  await redis.set(key, user, { ex: TTL_SECONDS });
};

export const getNeynarUsers = async (fids: number[]) => {
  if (!redis) throw new Error("Redis client is not initialized");

  const keys = fids.map((fid) => `${NEYNAR_USER_PREFIX}fid:${fid}`);

  // Don't pass generics — Upstash infers correctly.
  const values = await redis.mget(keys);

  return values as (NeynarUser | null)[];
};

export const setNeynarUsers = async (users: NeynarUser[]) => {
  if (!redis) throw new Error("Redis client is not initialized");

  const pipeline = redis.pipeline();

  for (const user of users) {
    const key = `${NEYNAR_USER_PREFIX}fid:${user.fid}`;
    pipeline.set(key, user, { ex: TTL_SECONDS });
  }

  await pipeline.exec();
};

export const getNeynarUser = async (fid: string) => {
  if (!redis) return null;

  const key = `${NEYNAR_USER_PREFIX}fid:${fid}`;
  const data = await redis.get<NeynarUser>(key);

  return data ?? null;
};

export const setNeynarUser = async (fid: string, user: NeynarUser) => {
  if (!redis) return;

  const key = `${NEYNAR_USER_PREFIX}fid:${fid}`;
  await redis.set(key, user, { ex: TTL_SECONDS });
};
