import dynamic from "next/dynamic";
import { env } from "@/lib/env";
import { Metadata } from "next";

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

const PoolPage = dynamic(() => import("@/components/Pool"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function Home() {
  return <PoolPage />;
}
