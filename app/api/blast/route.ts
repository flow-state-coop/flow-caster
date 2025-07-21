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

    const result = await sendFrameNotificationToAllUsers({
      title: notification.title,
      body: notification.body,
      notificationDetails: notification.notificationDetails,
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
