import { Client } from "@upstash/workflow";

const token = process.env.QSTASH_TOKEN || process.env.NEXT_PUBLIC_QSTASH_TOKEN;
const client = new Client({ token });

const appUrl = process.env.NEXT_PUBLIC_URL;

export const triggerDonationWorkflow = async ({
  poolid,
  chainid,
  poolname,
  username,
  flowrate,
}: {
  poolid: string;
  chainid: string;
  poolname: string;
  username: string;
  flowrate: string;
}) => {
  console.log("triggerDonationWorkflow poolid", poolid);
  const { workflowRunId } = await client.trigger({
    url: `${appUrl}/api/workflow/donate`,
    body: {
      poolid,
      chainid,
      poolname,
      username,
      flowrate,
    },
    headers: { Authorization: `Bearer ${token}` }, // Optional headers
    // workflowRunId: "my-workflow", // Optional workflow run ID
    retries: 3, // Optional retries for the initial request
  });

  return workflowRunId;
};
