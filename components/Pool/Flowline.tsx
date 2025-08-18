"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface FlowLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  rate?: string; // Flow rate from donor data
}

export default function FlowLine({
  x1,
  y1,
  x2,
  y2,
  rate = "small",
}: FlowLineProps) {
  const lineRef = useRef<SVGLineElement>(null);
  const particleRef = useRef<SVGCircleElement>(null);

  // Determine size and speed based on rate
  const getParticleConfig = (rate: string) => {
    if (rate === "large") {
      return { size: 14, speed: 0.8 }; // Large, fast
    } else if (rate === "medium") {
      return { size: 8, speed: 1.2 }; // Medium, medium
    } else {
      return { size: 4, speed: 1.8 }; // Small, slow
    }
  };

  const config = getParticleConfig(rate);

  useEffect(() => {
    // if (VIS_ON === "paused") return;
    // Animate particle from donor to pool
    const duration = 1.5 / config.speed;
    gsap.fromTo(
      particleRef.current,
      { attr: { cx: x1, cy: y1 } },
      {
        attr: { cx: x2, cy: y2 },
        repeat: -1,
        duration,
        ease: "linear",
        onRepeat: () => {
          // Reset to start
          gsap.set(particleRef.current, { attr: { cx: x1, cy: y1 } });
        },
      }
    );
  }, [x1, y1, x2, y2, config.speed]);

  return (
    <g>
      <line
        ref={lineRef}
        id="flow-line"
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.7}
        className="stroke-accent-800 transition-opacity duration-1000 ease-in"
      />
      <circle
        ref={particleRef}
        cx={x1}
        cy={y1}
        r={config.size}
        fill="#D95D39"
        opacity={0.85}
        filter="drop-shadow(0 0 8px #D95D39)"
      />
    </g>
  );
}
