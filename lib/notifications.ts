import type { MiniAppNotificationDetails } from "@farcaster/miniapp-sdk";
import { redis } from "./redis";

const notificationServiceKey = "flowcaster:miniapp";

function getUserNotificationDetailsKey(fid: number): string {
  return `${notificationServiceKey}:user:${fid}`;
}

export async function getUserNotificationDetails(
  fid: number
): Promise<MiniAppNotificationDetails | null> {
  if (!redis) {
    return null;
  }

  return await redis.get<MiniAppNotificationDetails>(
    getUserNotificationDetailsKey(fid)
  );
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: MiniAppNotificationDetails
): Promise<void> {
  if (!redis) {
    return;
  }

  await redis.set(getUserNotificationDetailsKey(fid), notificationDetails);
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  if (!redis) {
    return;
  }

  await redis.del(getUserNotificationDetailsKey(fid));
}

export async function getAllUserNotificationDetails(): Promise<
  MiniAppNotificationDetails[] | null
> {
  if (!redis) {
    return null;
  }
  const allKeys: string[] = [];
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: `${notificationServiceKey}:user:*`,
      count: 100,
    });

    cursor = nextCursor;
    allKeys.push(...keys);
  } while (cursor !== "0");

  console.log("allKeys", allKeys.length);

  return await redis.mget<MiniAppNotificationDetails[]>(allKeys);
}
