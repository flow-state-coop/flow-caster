import { sendFrameNotificationToAllUsers } from "@/lib/notification-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { poolid, chainid, poolname, username, flowrate } = body;

    const token = poolid == "5" ? "USND" : "USDCx";

    const result = await sendFrameNotificationToAllUsers({
      title: "Whoaaa, that's a big stream 🌊!",
      body: `${username} is streaming ${flowrate} ${token}/mo to ${poolname}.`,
      targetUrl: `${process.env.NEXT_PUBLIC_URL}/pool/${chainid}/${poolid}`,
    });

    if (result.state === "error") {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
