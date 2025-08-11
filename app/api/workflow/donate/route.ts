import { sendFrameNotificationToAllUsers } from "@/lib/notification-client";
import { serve } from "@upstash/workflow/nextjs";

type LaunchWorkflowPayload = {
  poolid: string;
  chainid: string;
  poolname: string;
  username: string;
  flowrate: string;
};

export const { POST } = serve(async (context) => {
  console.log("context.re", context.requestPayload);
  const { poolid, chainid, poolname, username, flowrate } =
    context.requestPayload as LaunchWorkflowPayload;
  if (!poolid || !chainid || !poolname || !username || !flowrate) {
    return;
  }

  await context.run("notifyDonate", () => {
    sendFrameNotificationToAllUsers({
      title: "A stream has been opened!",
      body: `${username} is streaming ${flowrate} USDCx/mo to ${poolname}.`,
      targetUrl: `${process.env.NEXT_PUBLIC_URL}/pool/${chainid}/${poolid}`,
    });
  });
});
