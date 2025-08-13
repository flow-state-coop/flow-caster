import { NextRequest, NextResponse } from "next/server";
import { networks } from "@/lib/flowapp/networks";
import {
  FLOW_SPLITTER_POOL_QUERY,
  SUPERFLUID_QUERY,
} from "@/lib/flowapp/queries";
import { GraphQLClient } from "graphql-request";
import { FlowPoolData, PoolData } from "@/lib/types";
import { DEFAULT_POOL_ID } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    // Get query parameters from the URL
    const { searchParams } = new URL(request.url);
    const member = searchParams.get("member");
    const chainId = searchParams.get("chainId");

    const network = networks.find((network) => network.id === Number(chainId));

    // Validate required parameters
    if (!member || !chainId || !network) {
      return NextResponse.json(
        { error: "Missing required parameters: member and chainId" },
        { status: 400 }
      );
    }

    // Validate access token
    const accessToken = process.env.FLOW_CASTER_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "FLOW_CASTER_ACCESS_TOKEN not configured" },
        { status: 500 }
      );
    }

    const flowUrl = network.flowSplitterSubgraph;
    const sfUrl = network.superfluidSubgraph;
    const flowClient = new GraphQLClient(flowUrl);
    const sfClient = new GraphQLClient(sfUrl);

    const flowSplitterPoolQueryRes = (await flowClient.request(
      FLOW_SPLITTER_POOL_QUERY,
      { poolId: `0x${Number(DEFAULT_POOL_ID).toString(16)}` }
    )) as { pools: FlowPoolData[] };

    const pool = flowSplitterPoolQueryRes?.pools[0];

    console.log("pool", pool);

    if (!pool) {
      throw Error("Missing Pool");
    }

    const superfluidQueryRes = (await sfClient.request(SUPERFLUID_QUERY, {
      token: pool.token,
      gdaPool: pool.poolAddress,
    })) as { pool: PoolData };

    const farcasterDevsData = superfluidQueryRes?.pool;

    const memberIds = farcasterDevsData.poolMembers.map((m) =>
      m.account.id.toLowerCase()
    );

    if (!memberIds.includes(member.toLowerCase())) {
      throw Error("Member address has never been in the pool");
    }

    // Make API call to Flow Caster
    const response = await fetch(
      "https://flowstate.network/api/flow-caster/add-member",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          member,
          chainId,
        }),
      }
    );

    // Handle the response
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Flow Caster API error:", response.status, errorData);
      return NextResponse.json(
        { error: `Flow Caster API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
