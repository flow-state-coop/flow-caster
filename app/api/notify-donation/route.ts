import { sendFrameNotificationToAllUsers } from "@/lib/notification-client";
import { NextResponse } from "next/server";
import { resourceLimits } from "worker_threads";

type LaunchWorkflowPayload = {
  poolid: string;
  chainid: string;
  poolname: string;
  username: string;
  flowrate: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { poolid, chainid, poolname, username, flowrate } = body;

    const result = await sendFrameNotificationToAllUsers({
      title: "A stream has been opened!",
      body: `${username} is streaming ${flowrate} USDCx/mo to ${poolname}.`,
      targetUrl: `${process.env.NEXT_PUBLIC_URL}/pool/${chainid}/${poolid}`,
    });

    if (result.state === "error") {
      console.log("notification result.state ", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log("notification error", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
