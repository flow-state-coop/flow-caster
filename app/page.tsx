import dynamic from "next/dynamic";
import { Metadata } from "next";
import { env } from "@/lib/env";
import Spinner from "@/components/Shared/Spinner";

const appUrl = env.NEXT_PUBLIC_URL;

type Props = {
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

const HomePage = dynamic(() => import("@/components/Home"), {
  ssr: false,
  loading: () => <Spinner />,
});

export default function Home() {
  return <HomePage />;
}
