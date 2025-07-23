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
  let allKeys: string[] = [];
  let current = "1";
  while (Number(current) > 0) {
    const [cursor, keys] = await redis.scan(0, {
      match: `${notificationServiceKey}:*`,
    });
    allKeys = [...allKeys, ...keys];
    current = cursor;
  }

  return await redis.mget<MiniAppNotificationDetails[]>(allKeys);
}
