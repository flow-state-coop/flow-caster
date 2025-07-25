"use client";
import { sdk } from "@farcaster/miniapp-sdk";

export default function InfoDrawer() {
  const handleViewProfile = async () => {
    await sdk.actions.viewCast({
      hash: "0xcd9b0113",
    });
  };

  const onClaimSup = async () => {
    await sdk.actions.openMiniApp({
      url: "https://farcaster.xyz/miniapps/qva4-LdCMptX/sup",
    });
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-2 text-primary-800">
        <p>
          Open a token stream that&apos;s split in real-time to 78 cracked
          Farcaster devs{" "}
          <span
            onClick={handleViewProfile}
            className="underline text-primary-900 font-bold hover:cursor-pointer hover:text-primary-600"
          >
            (h/t @Curie curation).
          </span>
        </p>
        <p>
          Your stream delivers instant & consistent income so these builders can
          focus on building.
        </p>
        <p>
          Donors are eligible for
          <span
            onClick={onClaimSup}
            className="underline text-primary-900 font-bold hover:cursor-pointer hover:text-primary-600"
          >
            {" "}
            SUP Rewards.
          </span>
        </p>
      </div>
    </>
  );
}
