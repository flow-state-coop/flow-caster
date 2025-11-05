import dynamic from "next/dynamic";
import { Metadata } from "next";
import { env } from "@/lib/env";
import Spinner from "@/components/Shared/Spinner";

const appUrl = env.NEXT_PUBLIC_URL;

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: { chainid: string; poolid: string };
};

export async function generateMetadata({
  searchParams,
  params,
}: Props): Promise<Metadata> {
  const search = await searchParams;
  const { chainid, poolid } = await params;
  let imageUrl = `${appUrl}/api/share-donation?poolKey=${chainid}-${poolid}`;

  if (search.fid && search.flowRate) {
    imageUrl += `&fid=${search.fid}&flowRate=${search.flowRate}`;
  }

  if (search.tokenSymbol) {
    imageUrl += `&tokenSymbol=${search.tokenSymbol}`;
  }

  const frame = {
    version: "next",
    imageUrl: encodeURI(imageUrl),
    button: {
      title: "Launch flowcaster",
      action: {
        type: "launch_frame",
        name: "flowcaster",
        url: appUrl,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: "#ffffff",
      },
    },
  };
  return {
    title: "flowcaster",
    openGraph: {
      title: "flowcaster",
      description: "flowcaster",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

const LeaderboardPage = dynamic(() => import("@/components/Leaderboard"), {
  ssr: false,
  loading: () => <Spinner />,
});

export default function Home() {
  return <LeaderboardPage />;
}
