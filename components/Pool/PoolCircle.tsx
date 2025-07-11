"use client";
import { useMemo, useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { MiniAppContext } from "@farcaster/miniapp-core/dist/context";
import RecipientNode from "./RecipientNode";
import DonorNode from "./DonorNode";
import FlowLine from "./Flowline";
import gsap from "gsap";
import { PoolData } from "@/hooks/use-pool-data";
import { NeynarUser } from "@/lib/neynar";
import { createDonorBuckets } from "@/lib/pool";

interface PoolCircleProps {
  poolData?: PoolData;
  connectedUser?: NeynarUser;
}

export default function PoolCircle({
  poolData,
  connectedUser,
}: PoolCircleProps) {
  const radius = 370;
  const centerX = 400;
  const centerY = 150; // Move pool higher

  // console.log("page render at PoolCircle.tsx");

  const [streamOpened, setStreamOpened] = useState(false);
  const [streamOpenedCircle, setStreamOpenedCircle] = useState(false);
  const [recipientPositions, setRecipientPositions] = useState<any[]>([]);
  const poolCircleRef = useRef<SVGCircleElement>(null);
  const newParticleCircleRef = useRef<SVGCircleElement>(null);

  // Transform pool data to component format
  const recipients = useMemo(() => {
    if (!poolData) return [];
    return poolData.poolMembers.map((member) => ({
      accountId: member.account.id,
      units: parseInt(member.units),
      farcasterUser: member.farcasterUser,
    }));
  }, [poolData]);

  const donors = useMemo(() => {
    if (!poolData) return [];

    const formattedDonors = createDonorBuckets(
      poolData.poolDistributors,
      connectedUser
    );

    console.log("connectedUser", connectedUser);

    console.log("poolData.poolDistributors", poolData.poolDistributors);
    console.log("formattedDonors", formattedDonors);

    // return poolData.poolDistributors.map((member) => ({
    //   accountId: member.account.id,
    //   rate: member.flowRate,
    //   farcasterUser: member.farcasterUser,
    // }));

    return formattedDonors;
  }, [poolData]);

  const totalUnits = useMemo(() => {
    return recipients.reduce((sum: number, r: any) => sum + r.units, 0);
  }, [recipients]);

  useEffect(() => {
    // Calculate sizes first
    const poolArea = Math.PI * radius * radius;
    const availableArea = poolArea * 0.95; // Use 80% of pool area for recipients
    const avgAreaPerRecipient = availableArea / Math.max(recipients.length, 3);
    const baseRadius = Math.sqrt(avgAreaPerRecipient / Math.PI);

    const nodes = recipients.map((recipient) => {
      const unitRatio = recipient.units / totalUnits;
      const nodeRadius = Math.max(
        baseRadius * 0.8, // Min 80% of base size
        Math.min(
          baseRadius * 3, // Max 300% of base size
          baseRadius * unitRatio * 4 // Scale by units with multiplier
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
  }, [recipients, totalUnits]);

  // Animate pool outline and flow lines
  useEffect(() => {
    // Pool outline glow/pulse
    const poolOutlineAnimation = gsap.to("#pool-outline", {
      repeat: -1,
      yoyo: true,
      duration: 1.2,
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
      duration: 1.2,
      filter: "drop-shadow(0 0 12px #e3653b)",
      stroke: "#e3653b",
      strokeWidth: 12,
      opacity: 1,
      ease: "power1.inOut",
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
    if (process.env.NEXT_PUBLIC_VIS === "paused") return;
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

  useEffect(() => {
    if (!streamOpenedCircle) return;

    // Calculate the starting angle based on where the particle is placed
    // We need to find which donor's flow line triggered this animation
    const donor = donors[0]; // First donor
    if (!donor) return;

    const donorY = centerY + radius + 150;
    const donorSpacing = 200;
    const donorStartX = centerX - donorSpacing;
    const donorX = donorStartX + 0 * donorSpacing; // First donor
    const donorY_pos = donorY;

    // Calculate intersection point on pool edge
    const dx = centerX - donorX;
    const dy = centerY - donorY_pos;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const poolEdgeX = centerX - (dx / dist) * radius;
    const poolEdgeY = centerY - (dy / dist) * radius;

    // Calculate the starting angle from the pool center to the particle position
    const startAngle = Math.atan2(poolEdgeY - centerY, poolEdgeX - centerX);

    gsap.to(
      { angle: startAngle },
      {
        angle: startAngle + 2 * Math.PI,
        repeat: 5,
        duration: 0.5,
        ease: "linear",
        onComplete: handleOpenComplete,
        onUpdate: function () {
          const angle = this.targets()[0].angle;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          if (newParticleCircleRef.current) {
            newParticleCircleRef.current.setAttribute("cx", x.toString());
            newParticleCircleRef.current.setAttribute("cy", y.toString());
          }
        },
      }
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamOpenedCircle]);

  const handleOpenStream = () => {
    setStreamOpened(true);
  };

  const handleOpenComplete = () => {
    gsap.to(newParticleCircleRef.current, {
      opacity: 0,
      duration: 1,
      ease: "power2.out",
    });
  };

  if (!poolData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-lg text-red-500">No pool data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="flex flex-row justify-between items-center w-full mb-4">
        <p className="text-sm font-bold">Cracked Farcaster Devs Pool</p>
      </div>
      <svg
        width="400"
        height="500"
        viewBox="0 0 800 500"
        className="bg-black rounded-lg stroke-accent-800"
      >
        <circle
          ref={poolCircleRef}
          id="pool-outline"
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          strokeWidth="4"
          className="opacity-50"
        />
        {/* Flow lines from donors to pool */}
        {donors.map((donor, i) => {
          const donorY = centerY + radius + 150;
          const donorSpacing = 200;
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
            <g key={donor.accountId}>
              <FlowLine
                x1={x}
                y1={y}
                x2={poolEdgeX}
                y2={poolEdgeY}
                rate={rateString}
                streamOpened={
                  donor.accountId === donors[0]?.accountId && streamOpened
                }
                setStreamOpenedCircle={setStreamOpenedCircle}
              />
              {streamOpenedCircle &&
                donor.accountId === donors[0]?.accountId && (
                  <circle
                    ref={newParticleCircleRef}
                    id="pool-outline-particle"
                    cx={poolEdgeX}
                    cy={poolEdgeY}
                    r={45}
                    strokeWidth={0}
                    fill="#FFEA99"
                    opacity={0.98}
                    filter="blur(4px)"
                  />
                )}
            </g>
          );
        })}
        {/* Donor nodes in a row below the pool */}
        {donors.map((donor, i) => {
          // Place donors in a horizontal row below the pool
          const donorY = centerY + radius + 150; // 80px below pool edge
          const donorSpacing = 200; // horizontal spacing between donors
          const donorStartX = centerX - donorSpacing;
          const x = donorStartX + i * donorSpacing;
          const y = donorY;

          return (
            <DonorNode
              key={donor.accountId}
              x={x}
              y={y}
              accountId={donor?.accountId}
              rate={donor.rate}
              radius={60}
              farcasterUser={donor?.farcasterUser}
            />
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
            totalUnits={totalUnits}
            recipientCount={recipients.length}
            farcasterUser={recipient.farcasterUser}
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
      <div className="flex flex-row justify-start w-full gap-20">
        {donors.map((_, i) => {
          return (
            // <div key={i} className="text-xs">{`${donor.rate} USDCx / mo`}</div>
            <div key={i} className="text-xs">{`200 USDCx / mo`}</div>
          );
        })}
      </div>
      <button
        className="mt-5 px-3 py-1 rounded bg-accent-800 text-white text-lg hover:bg-accent-700"
        onClick={handleOpenStream}
      >
        Open Stream
      </button>
    </div>
  );
}
