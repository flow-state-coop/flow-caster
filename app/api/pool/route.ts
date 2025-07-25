import { NextRequest, NextResponse } from "next/server";
import { fetchUsersByEthAddress, NeynarUser } from "@/lib/neynar";
import { networks } from "@/lib/flowapp/networks";
import { GraphQLClient } from "graphql-request";
import {
  FLOW_SPLITTER_POOL_QUERY,
  SUPERFLUID_QUERY,
} from "@/lib/flowapp/queries";
import { PoolData } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type FlowPoolData = {
  token: string;
  poolAddress: string;
  name: string;
  symbol: string;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get("chainId");
    const poolId = searchParams.get("poolId");

    console.log(
      `Fetching pool data for chainId: ${chainId}, poolId: ${poolId}`
    );

    const network = networks.find((network) => network.id === Number(chainId));

    if (!network || !chainId || !poolId) {
      throw Error("Missing ChainId, PoolId or Network");
    }
    const flowUrl = network.flowSplitterSubgraph;
    const sfUrl = network.superfluidSubgraph;
    const flowClient = new GraphQLClient(flowUrl);
    const sfClient = new GraphQLClient(sfUrl);

    const flowSplitterPoolQueryRes = (await flowClient.request(
      FLOW_SPLITTER_POOL_QUERY,
      { poolId: `0x${Number(poolId).toString(16)}` }
    )) as { pools: FlowPoolData[] };

    const pool = flowSplitterPoolQueryRes?.pools[0];

    if (!pool) {
      throw Error("Missing Pool");
    }

    const superfluidQueryRes = (await sfClient.request(SUPERFLUID_QUERY, {
      token: pool.token,
      gdaPool: pool.poolAddress,
    })) as { pool: PoolData };

    const farcasterDevsData = superfluidQueryRes?.pool;

    if (!farcasterDevsData) {
      throw Error("Missing SF Pool");
    }

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
      poolMeta: {
        name: pool.name,
        symbol: pool.symbol,
      },
    };

    return NextResponse.json(enhancedPoolData);
  } catch (error) {
    console.error("Error fetching pool data:", error);
    return NextResponse.json(
      { error: `Failed to fetch pool data. ${error}` },
      { status: 500 }
    );
  }
}
