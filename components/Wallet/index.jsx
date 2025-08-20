"use client";

import { useAccount } from "wagmi";
import { PoolUserProvider } from "@/contexts/pool-user-context";
import { useUser } from "@/contexts/user-context";
import { usePoolData } from "@/hooks/use-pool-data";
import { FEATURED_POOL_DATA } from "@/lib/constants";
import { getTotalFlow } from "@/lib/pool";
import Footer from "../Shared/Footer";
import Spinner from "../Shared/Spinner";
import { openUrl } from "@/lib/helpers";
import { ArrowRight } from "lucide-react";
import ManageSupertoken from "./ManageSupertoken";

export default function Wallet() {
  const {
    data: poolData,
    poolDistributors,
    poolMembers,
    isLoading,
    error,
  } = usePoolData({
    chainId: FEATURED_POOL_DATA.DEFAULT_CHAIN_ID,
    poolId: FEATURED_POOL_DATA.DEFAULT_POOL_ID,
  });
  const { user } = useUser();
  const { address } = useAccount();

  if (isLoading || !poolData || !poolDistributors || !poolMembers || !user) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-lg text-accent-800">
          Failed to load. {error.message}
        </p>
      </div>
    );
  }

  return (
    <main className="relative">
      <PoolUserProvider
        poolDistributors={poolDistributors}
        poolMembers={poolMembers}
        user={user?.data}
        connectedAddress={address}
      >
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-2xl text-primary-500 font-bold mb-5">
            Manage Super Token Balance
          </h2>
          <div className="flex flex-col h-[calc(100vh-175px)] justify-between">
            <div className="min-h-72 px-4 py-3 bg-primary-100 border border-primary-500 rounded-lg">
              <ManageSupertoken address={address} />
            </div>
            <div className="bg-primary-100 border border-primary-400 px-4 py-3 rounded-lg">
              <button
                onClick={() => openUrl("https://app.superfluid.org/")}
                className="flex flew-row items-center gap-1 text-xs text-primary-500 hover:text-primary-300"
              >
                Access the Superfluid App for more features{" "}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => openUrl("https://app.superboring.xyz/en")}
                className="flex flew-row items-center gap-1 mt-2 text-xs text-primary-500 hover:text-primary-300"
              >
                Consider opening a streaming DCA with your USDC{" "}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <Footer
          chainId={FEATURED_POOL_DATA.DEFAULT_CHAIN_ID}
          poolId={FEATURED_POOL_DATA.DEFAULT_POOL_ID}
          poolAddress={poolData.id}
          totalFlow={getTotalFlow(poolData.poolDistributors).toString()}
        />
      </PoolUserProvider>
    </main>
  );
}
