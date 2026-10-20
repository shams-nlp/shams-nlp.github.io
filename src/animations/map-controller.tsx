import React, { useState, useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { Fig1Figure, PerVariety, perVariety } from "../figures/Fig1Figure";
import { interpolate } from "remotion";
import { EASE } from "../lib/scene";
import { SpeedOption, SPEED_PROFILES } from "../lib/speed-profiles";

interface MapControllerProps {
  speed: SpeedOption;
}

export const AnimatedMap: React.FC<MapControllerProps> = ({ speed }) => {
  const [progress, setProgress] = useState(0); // 0 to 1
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  const [figureHeight, setFigureHeight] = useState(600);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setFigureHeight(Math.max(340, Math.min(width * 0.98, 620)));
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Autonomous animation triggered on viewport enter, paced by chosen speed
  useEffect(() => {
    hasAnimatedRef.current = false;
    setProgress(0);

    const config = SPEED_PROFILES[speed];
    const durationMs = config.mapDurationSec * 1000;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          const startTime = performance.now();

          const loop = (now: number) => {
            const elapsed = now - startTime;
            const p = Math.min(1, Math.max(0, elapsed / durationMs));
            setProgress(p);
            if (p < 1) {
              requestAnimationFrame(loop);
            }
          };
          requestAnimationFrame(loop);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [speed]);

  // Progress segments (0 to 1)
  const mapProgress = interpolate(progress, [0, 0.22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  const wordProgress = interpolate(progress, [0, 0.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  const dotProgress: PerVariety = {
    1: interpolate(progress, [0.22, 0.36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    2: interpolate(progress, [0.36, 0.50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    3: interpolate(progress, [0.50, 0.64], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    4: interpolate(progress, [0.64, 0.78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    5: interpolate(progress, [0.78, 0.92], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  };

  const lineProgress: PerVariety = {
    1: interpolate(progress, [0.26, 0.40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    2: interpolate(progress, [0.40, 0.54], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    3: interpolate(progress, [0.54, 0.68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    4: interpolate(progress, [0.68, 0.82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    5: interpolate(progress, [0.82, 0.96], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
  };

  const labelProgress: PerVariety = {
    1: interpolate(progress, [0.28, 0.42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    2: interpolate(progress, [0.42, 0.56], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    3: interpolate(progress, [0.56, 0.70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    4: interpolate(progress, [0.70, 0.84], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    5: interpolate(progress, [0.84, 0.98], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
  };

  const labelStrength: PerVariety = perVariety(1);

  const handleReplay = () => {
    const config = SPEED_PROFILES[speed];
    const durationMs = config.mapDurationSec * 1000;
    const startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(1, Math.max(0, elapsed / durationMs));
      setProgress(p);
      if (p < 1) {
        requestAnimationFrame(loop);
      }
    };
    requestAnimationFrame(loop);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleReplay}
      title="Click to replay map animation"
      style={{ width: "100%", position: "relative", cursor: "pointer" }}
    >
      {/* Remotion Fig1Figure SVG Canvas (clean autonomous layout, no walkthrough guide) */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <Fig1Figure
          height={figureHeight}
          wordProgress={wordProgress}
          mapProgress={mapProgress}
          dotProgress={dotProgress}
          lineProgress={lineProgress}
          labelProgress={labelProgress}
          labelStrength={labelStrength}
          wordSettle={0}
          labelRise={16}
          ringGrowth={2.4}
          ringOpacity={0.85}
          ringStroke={2.5}
          paper={false}
        />
      </div>
    </div>
  );
};

let mapRoot: Root | null = null;

export function mountAnimatedMap(speed: SpeedOption) {
  const figureEl = document.querySelector(".teaser figure");
  if (!figureEl) return;

  let mountContainer = document.getElementById("shams-remotion-map-mount");
  if (!mountContainer) {
    mountContainer = document.createElement("div");
    mountContainer.id = "shams-remotion-map-mount";
    
    const img = figureEl.querySelector("img");
    if (img) img.style.display = "none";

    const cap = figureEl.querySelector("figcaption");
    if (cap) {
      figureEl.insertBefore(mountContainer, cap);
    } else {
      figureEl.appendChild(mountContainer);
    }
  }

  if (!mapRoot) {
    mapRoot = createRoot(mountContainer);
  }
  mapRoot.render(<AnimatedMap speed={speed} />);
}
