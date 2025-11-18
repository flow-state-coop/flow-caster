import { NextRequest, NextResponse } from "next/server";
import { GraphQLClient } from "graphql-request";
import { fetchUsersByEthAddress, NeynarUser } from "@/lib/neynar";
import { networks } from "@/lib/flowapp/networks";
import {
  FLOW_SPLITTER_POOL_QUERY,
  getSuperFluidQuery,
} from "@/lib/flowapp/queries";
import { FlowPoolData, PoolData } from "@/lib/types";
import { FEATURED_POOL_DATA, FEATURED_POOLS } from "@/lib/constants";
import { getArbCampaignDataForAddress } from "@/lib/arb-campaign";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get("chainId");
    const poolId = searchParams.get("poolId");
    const isCrackedDevs = searchParams.get("isCrackedDevs") === "true";

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

    // console.log("pool", pool);

    if (!pool) {
      throw Error("Missing Pool");
    }

    const query = getSuperFluidQuery(FEATURED_POOL_DATA.FILTER_ZERO_UNITS);

    const superfluidQueryRes = (await sfClient.request(query, {
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

      console.log("farcasterUsers", farcasterUsers);
    } catch (error) {
      console.error("Error fetching Farcaster users:", error);
      // Continue without Farcaster data if the API call fails
    }

    const splitterAdmins = pool.poolAdmins.map((a) => a.address.toLowerCase());

    // Enhance the pool data with Farcaster user information

    console.log("member count", farcasterDevsData.poolMembers.length);

    const members = isCrackedDevs
      ? farcasterDevsData.poolMembers.filter((member) => {
          // return false;
          return !splitterAdmins.includes(member.account.id.toLowerCase());
        })
      : farcasterDevsData.poolMembers;

    // Check if this pool should have arbCampaign data
    const poolKey = `${chainId}-${poolId}`;
    const poolConfig = FEATURED_POOLS[poolKey];
    const isArbPool = poolConfig?.IS_ARB === true;

    const enhancedPoolData = {
      ...farcasterDevsData,
      poolMembers: members.map((member) => {
        const enhancedMember = {
          ...member,
          farcasterUser:
            (farcasterUsers[member.account.id.toLowerCase()] &&
              farcasterUsers[member.account.id.toLowerCase()][0]) ||
            null,
        };

        // Add arbCampaign data if this is an ARB pool
        if (isArbPool) {
          const arbCampaignData = getArbCampaignDataForAddress(
            member.account.id
          );
          if (arbCampaignData.length > 0) {
            enhancedMember.arbCampaign = arbCampaignData;
          }
        }

        return enhancedMember;
      }),
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
      activeMemberCount: members.filter((m) => Number(m.units) > 0).length,
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
