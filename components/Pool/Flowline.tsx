"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";

interface FlowLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  flowRate?: number; // Optional, for particle size/speed
}

export default function FlowLine({
  x1,
  y1,
  x2,
  y2,
  flowRate = 1,
}: FlowLineProps) {
  const lineRef = useRef<SVGLineElement>(null);
  const particleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    // Animate particle from donor to pool
    const duration = 1.5 / flowRate; // Faster for higher flowRate
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
  }, [x1, y1, x2, y2, flowRate]);

  // Particle size based on flowRate
  const particleRadius = 6 + Math.min(flowRate, 5) * 2;

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
        className="stroke-accent-800"
      />
      <circle
        ref={particleRef}
        cx={x1}
        cy={y1}
        r={particleRadius}
        fill="#a78bfa"
        opacity={0.85}
        filter="drop-shadow(0 0 8px #a78bfa)"
      />
    </g>
  );
}
