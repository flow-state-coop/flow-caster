import { env } from "@/lib/env";

export interface NeynarUser {
  fid: string;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  verifications: string[];
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
