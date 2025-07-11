import { NextRequest, NextResponse } from "next/server";
import farcasterDevsData from "@/lib/data/farcasterDevs.json";
import { fetchUsersByEthAddress, NeynarUser } from "@/lib/neynar";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get("chainId");
    const poolId = searchParams.get("poolId");

    // For now, return the static data regardless of parameters
    // Later this will be replaced with real API calls based on chainId and poolId
    console.log(
      `Fetching pool data for chainId: ${chainId}, poolId: ${poolId}`
    );

    // Extract all Ethereum addresses from pool members and distributors
    const memberAddresses = farcasterDevsData.poolMembers.map(
      (member) => member.account.id
    );
    const distributorAddresses = farcasterDevsData.poolDistributors.map(
      (distributor) => distributor.account.id
    );

    // Combine all addresses and remove duplicates
    const allAddresses = Array.from(
      new Set([...memberAddresses, ...distributorAddresses])
    );

    // Fetch Farcaster user data for all addresses
    let farcasterUsers: Record<string, NeynarUser[]> = {};
    try {
      // Neynar API expects comma-separated addresses
      const addressesString = allAddresses.join(",");
      farcasterUsers = await fetchUsersByEthAddress(addressesString);
    } catch (error) {
      console.error("Error fetching Farcaster users:", error);
      // Continue without Farcaster data if the API call fails
    }

    // Enhance the pool data with Farcaster user information
    const enhancedPoolData = {
      ...farcasterDevsData,
      poolMembers: farcasterDevsData.poolMembers.map((member) => ({
        ...member,
        farcasterUser:
          (farcasterUsers[member.account.id.toLowerCase()] &&
            farcasterUsers[member.account.id.toLowerCase()][0]) ||
          null,
      })),
      poolDistributors: farcasterDevsData.poolDistributors.map(
        (distributor) => ({
          ...distributor,
          farcasterUser:
            (farcasterUsers[distributor.account.id.toLowerCase()] &&
              farcasterUsers[distributor.account.id.toLowerCase()][0]) ||
            null,
        })
      ),
    };

    return NextResponse.json(enhancedPoolData);
  } catch (error) {
    console.error("Error fetching pool data:", error);
    return NextResponse.json(
      { error: "Failed to fetch pool data" },
      { status: 500 }
    );
  }
}
