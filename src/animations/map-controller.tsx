import React, { useState, useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { Fig1Figure, PerVariety } from "../figures/Fig1Figure";
import { interpolate } from "remotion";
import { EASE } from "../lib/scene";
import { SpeedOption, SPEED_PROFILES } from "../lib/speed-profiles";

interface MapControllerProps {
  speed: SpeedOption;
}

const VARIETIES = [
  { id: 1, name: "Lebanese", phon: "ʾeltillak", flag: "🇱🇧" },
  { id: 2, name: "Syrian", phon: "ʾəltillak", flag: "🇸🇾" },
  { id: 3, name: "Pal. Rural", phon: "kultlak", flag: "🇵🇸" },
  { id: 4, name: "Pal. Urban", phon: "ʾultillak", flag: "🇵🇸" },
  { id: 5, name: "Jordanian", phon: "gultlak", flag: "🇯🇴" },
] as const;

export const AnimatedMap: React.FC<MapControllerProps> = ({ speed }) => {
  const [progress, setProgress] = useState(0); // 0 to 1
  const [selectedVariety, setSelectedVariety] = useState<number | null>(null);
  const [isPlayingTour, setIsPlayingTour] = useState(false);
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

  const playTour = () => {
    if (isPlayingTour) return;
    setIsPlayingTour(true);
    let step = 1;
    setSelectedVariety(1);

    const stepMs = speed === "slow" ? 1800 : speed === "fast" ? 900 : 1300;
    const timer = setInterval(() => {
      step++;
      if (step <= 5) {
        setSelectedVariety(step);
      } else {
        setSelectedVariety(null);
        setIsPlayingTour(false);
        clearInterval(timer);
      }
    }, stepMs);
  };

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

  const labelStrength: PerVariety = {
    1: selectedVariety === null || selectedVariety === 1 ? 1 : 0.28,
    2: selectedVariety === null || selectedVariety === 2 ? 1 : 0.28,
    3: selectedVariety === null || selectedVariety === 3 ? 1 : 0.28,
    4: selectedVariety === null || selectedVariety === 4 ? 1 : 0.28,
    5: selectedVariety === null || selectedVariety === 5 ? 1 : 0.28,
  };

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
      {/* Interactive Variety Filter Toolbar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginBottom: "14px",
        alignItems: "center"
      }}>
        <button
          onClick={() => setSelectedVariety(null)}
          style={{
            padding: "5px 12px",
            borderRadius: "16px",
            border: "1px solid var(--ink, #201C3C)",
            background: selectedVariety === null ? "var(--ink, #201C3C)" : "transparent",
            color: selectedVariety === null ? "var(--ivory, #FCF9F1)" : "var(--ink, #201C3C)",
            font: "600 12px/1.2 var(--head)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          All 5 Varieties
        </button>
        {VARIETIES.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedVariety(v.id)}
            style={{
              padding: "5px 12px",
              borderRadius: "16px",
              border: "1px solid var(--ink, #201C3C)",
              background: selectedVariety === v.id ? "var(--flame, #E84226)" : "transparent",
              borderColor: selectedVariety === v.id ? "var(--flame, #E84226)" : "rgba(32,28,60,0.3)",
              color: selectedVariety === v.id ? "#ffffff" : "var(--ink, #201C3C)",
              font: "500 12px/1.2 var(--head)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {v.flag} {v.name}: <i>{v.phon}</i>
          </button>
        ))}
        <button
          onClick={playTour}
          disabled={isPlayingTour}
          style={{
            marginLeft: "auto",
            padding: "5px 14px",
            borderRadius: "16px",
            border: "none",
            background: "var(--ember, #E06945)",
            color: "#ffffff",
            font: "600 12px/1.2 var(--head)",
            cursor: isPlayingTour ? "default" : "pointer",
            opacity: isPlayingTour ? 0.6 : 1,
            transition: "all 0.2s ease",
          }}
        >
          {isPlayingTour ? "Playing Tour..." : "▶ Walkthrough Tour"}
        </button>
      </div>

      {/* Remotion Fig1Figure SVG Canvas */}
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
