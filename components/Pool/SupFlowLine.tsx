"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface SupFlowLineProps {
  x1: number; // Pool edge point
  y1: number;
  x2: number; // Donor position
  y2: number;
  rate?: string;
}

export default function SupFlowLine({
  x1,
  y1,
  x2,
  y2,
  rate = "small",
}: SupFlowLineProps) {
  const lineRef = useRef<SVGLineElement>(null);
  const particleRef = useRef<SVGCircleElement>(null);

  // Determine size and speed based on rate (slower than regular FlowLine)
  const getParticleConfig = (rate: string) => {
    if (rate === "large") {
      return { size: 12, speed: 0.6 }; // Large, slower
    } else if (rate === "medium") {
      return { size: 7, speed: 0.9 }; // Medium
    } else {
      return { size: 4, speed: 1.2 }; // Small, slowest
    }
  };

  const config = getParticleConfig(rate);

  useEffect(() => {
    // Animate particle FROM pool (x1,y1) DOWN TO donor (x2,y2)
    const duration = 2.5 / config.speed; // Slower than regular flow lines
    gsap.fromTo(
      particleRef.current,
      { attr: { cx: x1, cy: y1 } },
      {
        attr: { cx: x2, cy: y2 },
        repeat: -1,
        duration,
        ease: "linear",
        onRepeat: () => {
          gsap.set(particleRef.current, { attr: { cx: x1, cy: y1 } });
        },
      }
    );
  }, [x1, y1, x2, y2, config.speed]);

  return (
    <g>
      <line
        ref={lineRef}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#75eb00"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.6}
        filter="drop-shadow(0 0 4px #75eb00)"
      />
      <circle
        ref={particleRef}
        cx={x1}
        cy={y1}
        r={config.size}
        fill="#75eb00"
        opacity={0.85}
        filter="drop-shadow(0 0 8px #75eb00)"
      />
    </g>
  );
}
