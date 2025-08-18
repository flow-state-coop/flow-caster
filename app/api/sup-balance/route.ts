import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import fluidLockerFactoryAbi from "@/lib/abi/fluidLockerFactory.json";
import fluidLockerAbi from "@/lib/abi/fluidLocker.json";
import { FLUID_LOCKER_CONTRACT, FEATURED_POOL_DATA } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        abi: fluidLockerFactoryAbi,
        functionName: "getLockerAddress",
        args: [address],
      })) as string;
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to read locker address", details: String(err) },
        { status: 500 }
      );
    }

    console.log("address", address);

    console.log("lockerAddress", lockerAddress);

    if (
      !lockerAddress ||
      lockerAddress === "0x0000000000000000000000000000000000000000"
    ) {
      return NextResponse.json(
        { error: "No locker address found for this user" },
        { status: 404 }
      );
    }

    let flowRate: bigint | undefined;
    try {
      const client = createPublicClient({
        chain: base,
        transport: http(),
      });
      flowRate = (await client.readContract({
        address: lockerAddress as `0x${string}`,
        abi: fluidLockerAbi,
        functionName: "getFlowRatePerProgram",
        args: [FEATURED_POOL_DATA.SUP_PROGRAM_ID],
      })) as bigint;

      console.log("*****flowRate", flowRate);
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to read flow rate", details: String(err) },
        { status: 500 }
      );
    }

    console.log("RETURN!!!!!!!!!!!");

    return NextResponse.json({
      flowRate: flowRate.toString(),
      lockerAddress,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
