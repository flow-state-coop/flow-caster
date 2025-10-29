"use client";
import { useMemo, useEffect, useState, useRef } from "react";
import Link from "next/link";
import * as d3 from "d3";
import gsap from "gsap";
import { Crown } from "lucide-react";
import { usePoolData } from "@/hooks/use-pool-data";
import { NeynarUser } from "@/lib/neynar";
import { createDonorBuckets } from "@/lib/pool";
import { usePool } from "@/contexts/pool-context";
import { VIZ_PAUSED } from "@/lib/constants";
import RecipientNode from "./RecipientNode";
import DonorNode from "./DonorNode";
import DonorStats from "./DonorStats";
import FlowLine from "./Flowline";

interface PoolCircleProps {
  connectedUser: NeynarUser | null | undefined;
  connectedAddress?: `0x${string}`;
  chainId: string;
  poolId: string;
}

interface PoolDonor {
  rate: string;
  farcasterUser: NeynarUser | null | undefined;
  accountId: string | undefined;
  startingAmount?: string;
  startingTimestamp?: string;
}

export default function PoolCircle({
  connectedUser,
  connectedAddress,
  chainId,
  poolId,
}: PoolCircleProps) {
  const radius = 370;
  const centerX = 400;
  const centerY = 170; // Move pool higher

  const [recipientPositions, setRecipientPositions] = useState<any[]>([]);
  const [donors, setDonors] = useState<PoolDonor[]>([]);
  const poolCircleRef = useRef<SVGCircleElement>(null);
  const { getCurrentPoolData } = usePool();
  const currentPoolData = getCurrentPoolData();

  const {
    poolDistributors,
    poolMembers,
    data: poolData,
  } = usePoolData({
    chainId: chainId,
    poolId: poolId,
  });

  const { poolDistributors: devPoolDistributors } = usePoolData({
    chainId,
    poolId: currentPoolData.DEV_POOL_ID,
  });

  // Transform pool data to component format
  const recipients = useMemo(() => {
    if (!poolMembers) return [];
    const formattedRecipients = poolMembers.map((member) => ({
      accountId: member.account.id,
      units: parseInt(member.units),
      startingAmount: member.poolTotalAmountDistributedUntilUpdatedAt,
      udpatedAt: member.updatedAtTimestamp,
      farcasterUser: member.farcasterUser,
      connected: member.isConnected,
    }));

    return formattedRecipients;
  }, [poolMembers]);

  useEffect(() => {
    if (!devPoolDistributors || !poolDistributors) return;

    const formattedDonors = createDonorBuckets(
      poolDistributors,
      devPoolDistributors,
      connectedAddress
    );

    setDonors(formattedDonors);
  }, [poolDistributors, devPoolDistributors, connectedAddress]);

  useEffect(() => {
    if (!poolData) return;
    // Calculate sizes first
    const poolArea = Math.PI * radius * radius;
    const availableArea = poolArea * 0.95; // Use 80% of pool area for recipients
    const avgAreaPerRecipient = availableArea / Math.max(recipients.length, 3);
    const baseRadius = Math.sqrt(avgAreaPerRecipient / Math.PI);

    const nodes = recipients.map((recipient) => {
      const unitRatio = recipient.units / Number(poolData.totalUnits);
      const nodeRadius = Math.max(
        baseRadius * 0.8, // Min 80% of base size
        Math.min(
          baseRadius * 3.5, // Max 350% of base size
          baseRadius * unitRatio * 10 // Scale by units with multiplier
        )
      );

      // Start with random position
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * (radius * 0.6); // Keep within 60% of pool radius
      return {
        ...recipient,
        x: centerX + distance * Math.cos(angle),
        y: centerY + distance * Math.sin(angle),
        radius: nodeRadius,
      };
    });

    // Throttle position updates to reduce rerenders
    let lastUpdateTime = 0;
    const updateThrottle = 40; // ~60fps

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "collide",
        d3.forceCollide().radius((d: any) => d.radius + 2)
      )
      .force("center", d3.forceCenter(centerX, centerY))
      .force("x", d3.forceX(centerX).strength(0.1))
      .force("y", d3.forceY(centerY).strength(0.1))
      .on("tick", () => {
        const now = Date.now();
        if (now - lastUpdateTime < updateThrottle) return;
        lastUpdateTime = now;

        // Keep nodes within pool bounds
        nodes.forEach((node: any) => {
          const distanceFromCenter = Math.sqrt(
            Math.pow(node.x - centerX, 2) + Math.pow(node.y - centerY, 2)
          );
          const maxDistance = radius - node.radius - 10; // 10px padding
          if (distanceFromCenter > maxDistance) {
            const angle = Math.atan2(node.y - centerY, node.x - centerX);
            node.x = centerX + maxDistance * Math.cos(angle);
            node.y = centerY + maxDistance * Math.sin(angle);
          }
        });
        setRecipientPositions([...nodes]);
      })
      .on("end", () => {
        setRecipientPositions([...nodes]);
      });
    return () => {
      simulation.stop();
    };
  }, [recipients, poolData]);

  // Animate pool outline and flow lines
  useEffect(() => {
    // Pool outline glow/pulse
    const poolOutlineAnimation = gsap.to("#pool-outline", {
      repeat: -1,
      yoyo: true,
      duration: 1,
      boxShadow: "0 0 32px 8px #e3653b",
      filter: "drop-shadow(0 0 16px #e3653b)",
      stroke: "#e3653b",
      strokeWidth: 8,
      opacity: 1,
      ease: "power1.inOut",
    });
    // Flow lines glow/pulse
    const flowLineAnimation = gsap.to("#flow-line", {
      repeat: -1,
      yoyo: true,
      duration: 1,
      filter: "drop-shadow(0 0 12px #e3653b)",
      stroke: "#e3653b",
      strokeWidth: 12,
      opacity: 1,
      ease: "power1.outIn",
    });

    return () => {
      poolOutlineAnimation.kill();
      flowLineAnimation.kill();
    };
  }, []);

  // Pool particles animation
  const poolParticles = Array.from({ length: 10 });
  const poolParticleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const poolParticleColors = [
    "#fdf4f1", // purple
    "#f7d3c7", // blue
    "#eb9173", // teal
    "#e3653b", // green
    "#c54a2a", // pink
  ];

  // Second set of particles (different speed)
  const poolParticles2 = Array.from({ length: 8 });
  const poolParticleRefs2 = useRef<(SVGCircleElement | null)[]>([]);
  const poolParticleColors2 = [
    "#fef3c7", // yellow
    "#fbbf24", // amber
    "#f59e0b", // orange
    "#d97706", // deep orange
  ];

  useEffect(() => {
    if (VIZ_PAUSED) return;
    // Only run particle animations when data is loaded
    if (!poolData) return;

    poolParticles.forEach((_, i) => {
      const ref = poolParticleRefs.current[i];
      if (!ref) return;
      gsap.to(
        { angle: (2 * Math.PI * i) / poolParticles.length },
        {
          angle: (2 * Math.PI * i) / poolParticles.length + 2 * Math.PI,
          repeat: -1,
          duration: 3,
          ease: "linear",
          onUpdate: function () {
            const angle = this.targets()[0].angle;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            if (ref) {
              ref.setAttribute("cx", x.toString());
              ref.setAttribute("cy", y.toString());
            }
          },
        }
      );
    });

    // Second set of particles (slower)
    poolParticles2.forEach((_, i) => {
      const ref = poolParticleRefs2.current[i];
      if (!ref) return;
      gsap.to(
        { angle: (2 * Math.PI * i) / poolParticles2.length },
        {
          angle: (2 * Math.PI * i) / poolParticles2.length + 2 * Math.PI,
          repeat: -1,
          duration: 6, // 2x slower
          ease: "linear",
          onUpdate: function () {
            const angle = this.targets()[0].angle;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            if (ref) {
              ref.setAttribute("cx", x.toString());
              ref.setAttribute("cy", y.toString());
            }
          },
        }
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolData]);

  if (!poolData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-lg text-black">No pool data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <svg width="390" height="500" viewBox="0 0 800 500" className="bg-white">
        <circle
          ref={poolCircleRef}
          id="pool-outline"
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="#f7d3c7"
          strokeWidth="4"
          className="opacity-50"
        />

        {/* Text path for pool name */}
        <defs>
          <path
            id="pool-text-path"
            d={`M ${centerX} ${centerY - radius - 25} A ${radius + 25} ${
              radius + 25
            } 0 0 1 ${centerX + radius + 25} ${centerY}`}
            fill="none"
          />
        </defs>
        <text className="text-black font-bold text-2xl">
          <textPath href="#pool-text-path" startOffset="0%" textAnchor="start">
            {currentPoolData.CONTENT.POOL_TITLE}
          </textPath>
        </text>

        {/* Flow lines from donors to pool */}
        {donors.map((donor, i) => {
          const donorY = centerY + radius + 150;
          const donorSpacing = 250;
          const donorStartX = centerX - donorSpacing;
          const x = donorStartX + i * donorSpacing;
          const y = donorY;

          // Skip flow line if rate is "0"
          // const rateNum = parseFloat(donor.rate);
          const rateNum = parseFloat(donor.rate);

          if (rateNum === 0) return null;

          // Calculate intersection point on pool edge (from donor to pool center)
          const dx = centerX - x;
          const dy = centerY - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const poolEdgeX = centerX - (dx / dist) * radius;
          const poolEdgeY = centerY - (dy / dist) * radius;

          // Determine rate string based on donor flow rate (normalize large numbers)
          let rateString = "small";
          const normalizedRate = rateNum / 1e15; // Normalize to reasonable range
          if (normalizedRate >= 2) {
            rateString = "large";
          } else if (normalizedRate >= 1) {
            rateString = "medium";
          }

          return (
            <g key={`${donor.accountId}-${donor.rate}-${i}`}>
              <FlowLine
                x1={x}
                y1={y}
                x2={poolEdgeX}
                y2={poolEdgeY}
                rate={rateString}
              />
            </g>
          );
        })}
        {/* Donor nodes in a row below the pool */}
        {donors.map((donor, i) => {
          // Place donors in a horizontal row below the pool
          const donorY = centerY + radius + 150; // 80px below pool edge
          const donorSpacing = 250; // horizontal spacing between donors
          const donorStartX = centerX - donorSpacing;
          const x = donorStartX + i * donorSpacing;
          const y = donorY;
          const isUserDonor = i === 0;
          const isMiddleDonor = i === 1; // 2nd donor (index 1) is the middle one
          const isGroupDonors = i === 2; // 2nd donor (index 1) is the middle one

          return (
            <g key={`${donor.accountId}-${donor.rate}-${i}`}>
              {/* Crown for middle donor */}
              {isMiddleDonor && (
                <g transform={`translate(${x + 54}, ${y - 140}) rotate(45)`}>
                  <Crown width={120} height={120} fill="gold" />
                </g>
              )}

              {isUserDonor && (
                <DonorNode
                  index={i}
                  x={x}
                  y={y}
                  accountId={donor?.accountId}
                  radius={60}
                  farcasterUser={donor?.farcasterUser}
                  isGroupDonors={isGroupDonors}
                  isMiddleDonor={isMiddleDonor}
                  donorCount={poolData.poolDistributors.length}
                  connectedUserFallback={
                    isUserDonor ? connectedUser : undefined
                  }
                  tokenSymbol={poolData.token.symbol}
                />
              )}

              {isMiddleDonor && (
                <DonorNode
                  index={i}
                  x={x}
                  y={y}
                  accountId={donor?.accountId}
                  radius={60}
                  farcasterUser={donor?.farcasterUser}
                  isGroupDonors={isGroupDonors}
                  isMiddleDonor={isMiddleDonor}
                  donorCount={poolData.poolDistributors.length}
                  connectedUserFallback={
                    isUserDonor ? connectedUser : undefined
                  }
                  rate={donor?.rate}
                  startingAmount={donor?.startingAmount}
                  startingTimestamp={donor?.startingTimestamp}
                  tokenSymbol={poolData.token.symbol}
                />
              )}

              {isGroupDonors && (
                <Link href={`/pool/${chainId}/${poolId}/leaderboard`}>
                  <DonorNode
                    index={i}
                    x={x}
                    y={y}
                    accountId={donor?.accountId}
                    radius={60}
                    farcasterUser={donor?.farcasterUser}
                    isGroupDonors={isGroupDonors}
                    isMiddleDonor={isMiddleDonor}
                    donorCount={poolData.poolDistributors.length}
                    connectedUserFallback={
                      isUserDonor ? connectedUser : undefined
                    }
                    tokenSymbol={poolData.token.symbol}
                  />
                </Link>
              )}
            </g>
          );
        })}
        {/* Recipients inside the pool */}
        {recipientPositions.map((recipient) => (
          <RecipientNode
            key={recipient.accountId}
            x={recipient.x}
            y={recipient.y}
            radius={recipient.radius}
            accountId={recipient.accountId}
            units={recipient.units}
            totalUnits={Number(poolData.totalUnits)}
            farcasterUser={recipient.farcasterUser}
            totalFlowRate={Number(poolData.flowRate)}
            connected={recipient.connected}
            tokenSymbol={poolData.token.symbol}
          />
        ))}
        {/* Pool circle particles */}
        {poolParticles.map((_, i) => {
          const angle = (2 * Math.PI * i) / poolParticles.length;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          const color = poolParticleColors[i % poolParticleColors.length];
          return (
            <circle
              key={i}
              ref={(el) => {
                poolParticleRefs.current[i] = el || null;
              }}
              cx={x}
              cy={y}
              r={10}
              fill={color}
              opacity={0.85}
              filter={`drop-shadow(0 0 8px ${color})`}
            />
          );
        })}
        {/* Second set of pool particles (slower) */}
        {poolParticles2.map((_, i) => {
          const angle = (2 * Math.PI * i) / poolParticles2.length;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          const color = poolParticleColors2[i % poolParticleColors2.length];
          return (
            <circle
              key={`particle2-${i}`}
              ref={(el) => {
                poolParticleRefs2.current[i] = el || null;
              }}
              cx={x}
              cy={y}
              r={6} // Smaller size
              fill={color}
              opacity={0.7}
              filter={`drop-shadow(0 0 6px ${color})`}
            />
          );
        })}
      </svg>
      <div className="flex flex-row justify-between w-full mt-2">
        {donors.map((donor, i) => {
          return (
            <DonorStats
              key={`${donor.accountId}-${donor.rate}-${i}`}
              rate={donor.rate}
              showSup={i < 2}
              showTotalFlow={i > 1}
              startingTimestamp={poolData.updatedAtTimestamp}
              startingAmount={poolData.totalAmountDistributedUntilUpdatedAt}
              donorAddress={donor.accountId}
              tokenSymbol={poolData.token.symbol}
            />
          );
        })}
      </div>
    </div>
  );
}
