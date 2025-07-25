import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import fluidLockerAbi from "@/lib/abi/fluidLocker.json";
import { FLUID_LOCKER_CONTRACT } from "@/lib/constants";
import { networks } from "@/lib/flowapp/networks";
import { GraphQLClient } from "graphql-request";
import { SF_SUP_TOKEN_SNAPSHOT } from "@/lib/flowapp/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Find the Base network config
const BASE_NETWORK_ID = 8453;
const baseNetwork = networks.find((n) => n.id === BASE_NETWORK_ID);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    if (!address) {
      return NextResponse.json(
        { error: "Missing address parameter" },
        { status: 400 }
      );
    }

    // Get the locker address for the user
    let lockerAddress: string | undefined;
    try {
      const client = createPublicClient({
        chain: base,
        transport: http(),
      });
      lockerAddress = (await client.readContract({
        address: FLUID_LOCKER_CONTRACT as `0x${string}`,
        abi: fluidLockerAbi,
        functionName: "getLockerAddress",
        args: [address],
      })) as string;
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to read locker address", details: String(err) },
        { status: 500 }
      );
    }

    if (
      !lockerAddress ||
      lockerAddress === "0x0000000000000000000000000000000000000000"
    ) {
      return NextResponse.json(
        { error: "No locker address found for this user" },
        { status: 404 }
      );
    }

    // Query the Superfluid subgraph for the SUP token snapshot
    if (!baseNetwork?.superfluidSubgraph) {
      return NextResponse.json(
        { error: "Base network subgraph not configured" },
        { status: 500 }
      );
    }
    const sfClient = new GraphQLClient(baseNetwork.superfluidSubgraph);
    let snapshotRes: any;
    try {
      snapshotRes = await sfClient.request(SF_SUP_TOKEN_SNAPSHOT, {
        address: lockerAddress.toLowerCase(),
      });
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to query Superfluid subgraph", details: String(err) },
        { status: 500 }
      );
    }
    const snapshot = snapshotRes?.accountTokenSnapshots?.[0];
    if (!snapshot) {
      return NextResponse.json(
        { error: "No SUP token snapshot found for this locker address" },
        { status: 404 }
      );
    }
    console.log("snapshot", snapshot);
    // Only return the relevant fields
    return NextResponse.json({
      balanceUntilUpdatedAt: snapshot.balanceUntilUpdatedAt,
      totalNetFlowRate: snapshot.totalNetFlowRate,
      updatedAtTimestamp: snapshot.updatedAtTimestamp,
      totalInflowRate: snapshot.totalInflowRate,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
