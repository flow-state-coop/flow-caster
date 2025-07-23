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
        <p>Flow Caster is a mini app for supporting builders on Farcaster.</p>
        <p>
          Start by opening a token stream to a curated list of 78 cracked
          Farcaster devs{" "}
          <span
            onClick={handleViewProfile}
            className="underline text-primary-900 font-bold hover:cursor-pointer hover:text-primary-600"
          >
            (h/t @Curie).
          </span>
        </p>
        <p>
          Streams are split & distributed in real-time providing sustainable
          income for these builders to keep building.
        </p>
        <p>
          Donors are eligible for SUP Rewards based on volume, so keep
          streaming.
        </p>
        <p
          onClick={onClaimSup}
          className="underline text-primary-900 font-bold hover:cursor-pointer hover:text-primary-600"
        >
          Open SUP mini app
        </p>
      </div>
    </>
  );
}
