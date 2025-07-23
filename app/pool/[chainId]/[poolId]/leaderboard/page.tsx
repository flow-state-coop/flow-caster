import dynamic from "next/dynamic";
import { env } from "@/lib/env";
import { Metadata } from "next";

const appUrl = env.NEXT_PUBLIC_URL;

type Props = {
  // params: Promise<{ chainid: string; poolId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const search = await searchParams;
  let imageUrl = `${appUrl}/api/share`;

  if (search.totalFlow || search.totalFlow === "0") {
    imageUrl += `?totalFlow=${search.totalFlow}`;
  }
  const frame = {
    version: "next",
    imageUrl: imageUrl,
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
  loading: () => <div>Loading...</div>,
});

export default function Home() {
  return <LeaderboardPage />;
}
