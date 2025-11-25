import { env } from "@/lib/env";
import { getNeynarUsers, setNeynarUsers } from "./redis";

export interface NeynarUser {
  fid: string;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  verifications: string[];
  verified_addresses: {
    eth_addresses: string[];
    primary: {
      eth_address: string;
    };
  };
}

export const fetchUser = async (fid: string): Promise<NeynarUser> => {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    {
      headers: {
        "x-api-key": env.NEYNAR_API_KEY!,
      },
    }
  );
  if (!response.ok) {
    console.error(
      "Failed to fetch Farcaster user on Neynar",
      await response.json()
    );
    throw new Error("Failed to fetch Farcaster user on Neynar");
  }
  const data = await response.json();
  return data.users[0];
};

const normalizeAddress = (address: string) => address.trim().toLowerCase();

export const fetchUsersByEthAddress = async (
  addressesInput: string | string[]
): Promise<Record<string, NeynarUser[]>> => {
  const addresses = Array.isArray(addressesInput)
    ? addressesInput
    : addressesInput.split(",").map((address) => address.trim());

  const normalizedAddresses = Array.from(
    new Set(
      addresses
        .map((address) => normalizeAddress(address))
        .filter((address) => address.length > 0)
    )
  );

  if (!normalizedAddresses.length) {
    return {};
  }

  let cached: (NeynarUser | null)[] = [];
  try {
    cached = await getNeynarUsers(normalizedAddresses);
  } catch (error) {
    console.error("Failed to read Neynar users from cache", error);
    cached = normalizedAddresses.map(() => null);
  }

  const result: Record<string, NeynarUser[]> = {};
  const missingAddresses = new Set<string>();

  normalizedAddresses.forEach((address, index) => {
    const cachedUser = cached[index];
    if (cachedUser) {
      result[address] = [cachedUser];
    } else {
      missingAddresses.add(address);
    }
  });

  if (!missingAddresses.size) {
    return result;
  }

  const missingList = Array.from(missingAddresses);
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk-by-address/?addresses=${missingList.join(
      ","
    )}`,
    {
      headers: {
        "x-api-key": env.NEYNAR_API_KEY!,
      },
    }
  );
  if (!response.ok) {
    console.error(
      "Failed to fetch Farcaster users on Neynar",
      await response.json()
    );
    throw new Error("Failed to fetch Farcaster user on Neynar");
  }
  const data = (await response.json()) as Record<string, NeynarUser[]>;
  const normalizedData = Object.entries(data).reduce<
    Record<string, NeynarUser[]>
  >((acc, [address, users]) => {
    acc[normalizeAddress(address)] = users ?? [];
    return acc;
  }, {});

  const cacheableUsers: Array<{ address: string; user: NeynarUser }> = [];

  for (const address of missingList) {
    const users = normalizedData[address] ?? [];
    result[address] = users;
    if (users[0]) {
      cacheableUsers.push({ address, user: users[0] });
    }
  }

  if (cacheableUsers.length) {
    await setNeynarUsers(cacheableUsers);
  }

  for (const address of normalizedAddresses) {
    if (!result[address]) {
      result[address] = [];
    }
  }

  return result;
};
