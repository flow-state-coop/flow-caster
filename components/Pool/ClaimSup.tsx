import { useSupPoints } from "@/hooks/use-sup-points";
import { useAccount } from "wagmi";
import { sdk } from "@farcaster/miniapp-sdk";
import FlowAmount from "./FlowAmount";

interface ClaimSupProps {
  // onClaimSup: () => void;
}

export default function ClaimSup(params: ClaimSupProps) {
  const { address } = useAccount();
  const { data } = useSupPoints({
    userAddress: address,
  });

  console.log("address", address);

  console.log("data", data);

  const onClaimSup = async () => {
    console.log("claiming");

    await sdk.actions.openMiniApp({
      url: "https://farcaster.xyz/miniapps/qva4-LdCMptX/sup",
    });
  };
  return (
    <>
      <div className="mb-6">
        <p className="text-primary-500 text-sm">
          Open donation streams to earn SUP.
        </p>
      </div>

      {data && (
        <div className="flex flex-col items-center w-full gap-1 mb-6">
          <p className="font-bold text-black">Your Reserve Balance</p>
          <div className="text-2xl font-bold text-brand-sfGreen mb-5">
            <FlowAmount
              textBefore="+"
              textAfter="SUP / mo"
              startingAmount={BigInt(data.balanceUntilUpdatedAt || "0")}
              startingTimestamp={Number(data.updatedAtTimestamp)}
              flowRate={BigInt(data.totalNetFlowRate)}
            />
          </div>
        </div>
      )}
      <button
        className="w-full px-4 py-3 rounded-lg bg-brand-sfGreen text-black font-bold"
        onClick={onClaimSup}
      >
        Claim SUP
      </button>
    </>
  );
}
