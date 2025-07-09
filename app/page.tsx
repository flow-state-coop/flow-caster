import dynamic from "next/dynamic";
import { env } from "@/lib/env";
import { Metadata } from "next";

const appUrl = env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/images/feed.png`,
  button: {
    title: "Launch Flow Splitter",
    action: {
      type: "launch_frame",
      name: "Flow Splitter",
      url: appUrl,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: "#ffffff",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Flow Splitter",
    openGraph: {
      title: "Flow Splitter",
      description: "Flow Splitter",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

const HomePage = dynamic(() => import("@/components/Home"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function Home() {
  return <HomePage />;
}
