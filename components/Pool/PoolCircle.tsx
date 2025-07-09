"use client";
import { useMemo, useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import RecipientNode from "./RecipientNode";
import DonorNode from "./DonorNode";
import FlowLine from "./Flowline";
import gsap from "gsap";

const sampleRecipients8 = [
  { accountId: "0x001", units: 1 },
  { accountId: "0x002", units: 2 },
  { accountId: "0x003", units: 1 },
  { accountId: "0x004", units: 3 },
  { accountId: "0x005", units: 1 },
  { accountId: "0x006", units: 2 },
  { accountId: "0x007", units: 1 },
  { accountId: "0x008", units: 1 },
];

// Generate 75 recipients with random units (1-5)
const sampleRecipients75 = Array.from({ length: 75 }, (_, i) => ({
  accountId: `0x${(i + 1).toString().padStart(3, "0")}`,
  units: Math.floor(Math.random() * 5) + 1,
}));

const sampleDonors = [
  { accountId: "0xd1" },
  { accountId: "0xd2" },
  { accountId: "0xd3" },
];

export default function PoolCircle() {
  const radius = 370;
  const centerX = 400;
  const centerY = 140; // Move pool higher

  const [useMany, setUseMany] = useState(false);
  const recipients = useMany ? sampleRecipients75 : sampleRecipients8;
  const totalUnits = recipients.reduce((sum, r) => sum + r.units, 0);
  const [recipientPositions, setRecipientPositions] = useState<any[]>([]);
  const poolCircleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    // Calculate sizes first
    const poolArea = Math.PI * radius * radius;
    const availableArea = poolArea * 0.8; // Use 80% of pool area for recipients
    const avgAreaPerRecipient = availableArea / Math.max(recipients.length, 3);
    const baseRadius = Math.sqrt(avgAreaPerRecipient / Math.PI);

    const nodes = recipients.map((recipient) => {
      const unitRatio = recipient.units / totalUnits;
      const nodeRadius = Math.max(
        baseRadius * 0.5, // Min 50% of base size
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
    gsap.to("#pool-outline", {
      repeat: -1,
      yoyo: true,
      duration: 1.2,
      boxShadow: "0 0 32px 8px #a78bfa",
      filter: "drop-shadow(0 0 16px #a78bfa)",
      stroke: "#a78bfa",
      strokeWidth: 8,
      opacity: 1,
      ease: "power1.inOut",
    });
    // Flow lines glow/pulse
    gsap.to("#flow-line", {
      repeat: -1,
      yoyo: true,
      duration: 1.2,
      filter: "drop-shadow(0 0 12px #a78bfa)",
      stroke: "#a78bfa",
      strokeWidth: 12,
      opacity: 1,
      ease: "power1.inOut",
    });
  }, []);

  // Pool particles animation
  const poolParticles = Array.from({ length: 10 });
  const poolParticleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const poolParticleColors = [
    "#a78bfa", // purple
    "#38bdf8", // blue
    "#2dd4bf", // teal
    "#4ade80", // green
    "#f472b6", // pink
  ];

  useEffect(() => {
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
  }, [centerX, centerY, radius]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="flex flex-row justify-around items-center w-full mb-4">
        <p>Cracked Farcaster Devs</p>
        <button
          className="px-3 py-1 rounded bg-accent-800 text-white text-xs hover:bg-accent-700"
          onClick={() => setUseMany((v) => !v)}
        >
          Toggle {useMany ? "8" : "75"} Recipients
        </button>
      </div>
      <svg
        width="400"
        height="600"
        viewBox="0 0 800 600"
        className="border border-gray-200 rounded-lg stroke-accent-800"
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
        {sampleDonors.map((donor, i) => {
          const donorY = centerY + radius + 150;
          const donorSpacing = 200;
          const donorStartX = centerX - donorSpacing;
          const x = donorStartX + i * donorSpacing;
          const y = donorY;
          // Calculate intersection point on pool edge (from donor to pool center)
          const dx = centerX - x;
          const dy = centerY - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const poolEdgeX = centerX - (dx / dist) * radius;
          const poolEdgeY = centerY - (dy / dist) * radius;
          return (
            <FlowLine
              key={donor.accountId}
              x1={x}
              y1={y}
              x2={poolEdgeX}
              y2={poolEdgeY}
            />
          );
        })}
        {/* Donor nodes in a row below the pool */}
        {sampleDonors.map((donor, i) => {
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
              accountId={donor.accountId}
              radius={60}
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
      </svg>
    </div>
  );
}
