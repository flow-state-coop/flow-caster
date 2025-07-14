import dynamic from "next/dynamic";
import { env } from "@/lib/env";
import { Metadata } from "next";

const appUrl = env.NEXT_PUBLIC_URL;

type Props = {
  params: Promise<{ chainid: string; poolId: string }>;
};

const frame = {
  version: "next",
  imageUrl: `${appUrl}/images/feed.png`,
  button: {
    title: "Launch Flow Caster",
    action: {
      type: "launch_frame",
      name: "Flow Caster",
      url: appUrl,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: "#ffffff",
    },
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  console.log("params", params);
  return {
    title: "Flow Caster",
    openGraph: {
      title: "Flow Caster",
      description: "Flow Caster",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

const LeaderboardPage = dynamic(() => import("@/components/Leaderboard"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function Home() {
  return <LeaderboardPage />;
}
