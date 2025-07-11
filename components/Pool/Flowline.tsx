"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";

interface FlowLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  rate?: string; // Flow rate from donor data
  streamOpened?: boolean;
  setStreamOpenedCircle: (circle: boolean) => void;
}

export default function FlowLine({
  x1,
  y1,
  x2,
  y2,
  rate = "small",
  streamOpened,
  setStreamOpenedCircle,
}: FlowLineProps) {
  const lineRef = useRef<SVGLineElement>(null);
  const particleRef = useRef<SVGCircleElement>(null);
  const newParticleRef = useRef<SVGCircleElement>(null);

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
    if (process.env.NEXT_PUBLIC_VIS === "paused") return;
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

  useEffect(() => {
    // Animate particle from donor to pool

    if (!streamOpened) return;
    const duration = 2;
    gsap.fromTo(
      newParticleRef.current,
      { attr: { cx: x1, cy: y1 }, opacity: 0.25 },
      {
        attr: { cx: x2, cy: y2 },
        opacity: 1,
        repeat: 0,
        duration,
        ease: "power4.out",
        onComplete: handleOpenComplete,
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x1, y1, x2, y2, streamOpened]);

  const handleOpenComplete = () => {
    // Hide the new particle by animating opacity to 0
    gsap.to(newParticleRef.current, {
      opacity: 0,
      duration: 0.1,
      ease: "power2.out",
    });
    setStreamOpenedCircle(true);
  };
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
      {streamOpened && (
        <circle
          ref={newParticleRef}
          cx={x1}
          cy={y1}
          r={45}
          strokeWidth={0}
          fill="#FFEA99"
          opacity={0.98}
          filter="blur(4px)"
        />
      )}
    </g>
  );
}
