import { Errors, createClient } from "@farcaster/quick-auth";

import { env } from "@/lib/env";
import { fetchUser } from "@/lib/neynar";
import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";
import { Address, zeroAddress } from "viem";

export const dynamic = "force-dynamic";

const quickAuthClient = createClient();

export const POST = async (req: NextRequest) => {
  const { referrerFid, token: farcasterToken } = await req.json();
  let fid;
  let isValidSignature;
  let walletAddress: Address = zeroAddress;
  let expirationTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  // Verify signature matches custody address and auth address
  try {
    const payload = await quickAuthClient.verifyJwt({
      domain: new URL(env.NEXT_PUBLIC_URL).hostname,
      token: farcasterToken,
    });
    isValidSignature = !!payload;
    fid = Number(payload.sub);
    walletAddress = payload.address as `0x${string}`;
    expirationTime = payload.exp ?? Date.now() + 7 * 24 * 60 * 60 * 1000;
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      console.error("Invalid token", e);
      isValidSignature = false;
    }
    console.error("Error verifying token", e);
  }

  if (!isValidSignature || !fid) {
    return NextResponse.json(
      { success: false, error: "Invalid token" },
      { status: 401 }
    );
  }

  const user = await fetchUser(fid.toString());

  // Generate JWT token
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const token = await new jose.SignJWT({
    fid,
    walletAddress,
    timestamp: Date.now(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secret);

  // Create the response
  const response = NextResponse.json({ success: true, user });

  // Set the auth cookie with the JWT token
  response.cookies.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  return response;
};
