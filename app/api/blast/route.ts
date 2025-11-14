import { sendFrameNotificationToAllUsers } from "@/lib/notification-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { notification, secretKey } = body;

    if (!secretKey || secretKey !== process.env.FLOW_CASTER_SECRET) {
      return NextResponse.json(
        { error: "missing castle secret" },
        { status: 401 }
      );
    }

    console.log("notification", notification);
    console.log("process.env.NEXT_PUBLIC_URL", process.env.NEXT_PUBLIC_URL);

    const result = await sendFrameNotificationToAllUsers({
      title: notification.title,
      body: notification.body,
      targetUrl: notification.targetUrl || `${process.env.NEXT_PUBLIC_URL}`,
    });

    console.log("result", result);

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
