import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get query parameters from the URL
    const { searchParams } = new URL(request.url);
    const member = searchParams.get("member");
    const chainId = searchParams.get("chainId");

    // Validate required parameters
    if (!member || !chainId) {
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
