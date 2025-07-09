import { fetchUser } from "@/lib/neynar";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const fid = request.headers.get("x-user-fid")!;
  const user = await fetchUser(fid);
  return NextResponse.json(user);
}
