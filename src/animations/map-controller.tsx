import React, { useState, useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { Fig1Figure, PerVariety, perVariety } from "../figures/Fig1Figure";
import { interpolate } from "remotion";
import { EASE, POP } from "../lib/scene";

export type MapMode = "autonomous" | "scrollytelling" | "interactive";

interface MapControllerProps {
  mode: MapMode;
}

const VARIETIES = [
  { id: 1, name: "Lebanese", phon: "ʾeltillak", flag: "🇱🇧" },
  { id: 2, name: "Syrian", phon: "ʾəltillak", flag: "🇸🇾" },
  { id: 3, name: "Pal. Rural", phon: "kultlak", flag: "🇵🇸" },
  { id: 4, name: "Pal. Urban", phon: "ʾultillak", flag: "🇵🇸" },
  { id: 5, name: "Jordanian", phon: "gultlak", flag: "🇯🇴" },
] as const;

export const AnimatedMap: React.FC<MapControllerProps> = ({ mode }) => {
  const [frame, setFrame] = useState(0);
  const [selectedVariety, setSelectedVariety] = useState<number | null>(null);
  const [isPlayingTour, setIsPlayingTour] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  // Responsive height calculation
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

  // Mode 2: Autonomous Viewport Triggered
  useEffect(() => {
    if (mode !== "autonomous") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          let f = 0;
          const totalFrames = 90; // 3 seconds at 30fps
          const interval = setInterval(() => {
            f += 1;
            setFrame(f);
            if (f >= totalFrames) clearInterval(interval);
          }, 1000 / 30);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mode]);

  // Mode 1: Scrollytelling Scrubbing
  useEffect(() => {
    if (mode !== "scrollytelling") return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      
      // Calculate progress while element moves through viewport
      const start = windowH * 0.85;
      const end = windowH * 0.15;
      const total = start - end;
      const current = start - rect.top;
      const rawProgress = Math.min(1, Math.max(0, current / total));
      
      // Map to 0-90 frames
      setFrame(Math.round(rawProgress * 90));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mode]);

  // Tour walkthrough for Mode 3
  const playTour = () => {
    if (isPlayingTour) return;
    setIsPlayingTour(true);
    let step = 1;
    setSelectedVariety(1);

    const timer = setInterval(() => {
      step++;
      if (step <= 5) {
        setSelectedVariety(step);
      } else {
        setSelectedVariety(null);
        setIsPlayingTour(false);
        clearInterval(timer);
      }
    }, 1300);
  };

  // Calculate progress values based on current frame and mode
  const effectiveFrame = mode === "interactive" && !isPlayingTour ? 90 : frame;

  // Sea and base map: frames 0 to 20
  const mapProgress = interpolate(effectiveFrame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  // Word قلتلك: frames 0 to 18
  const wordProgress = interpolate(effectiveFrame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  // Varieties staggered from frame 20 to 80
  const dotProgress: PerVariety = {
    1: interpolate(effectiveFrame, [20, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    2: interpolate(effectiveFrame, [32, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    3: interpolate(effectiveFrame, [44, 56], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    4: interpolate(effectiveFrame, [56, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    5: interpolate(effectiveFrame, [68, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  };

  const lineProgress: PerVariety = {
    1: interpolate(effectiveFrame, [24, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    2: interpolate(effectiveFrame, [36, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    3: interpolate(effectiveFrame, [48, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    4: interpolate(effectiveFrame, [60, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    5: interpolate(effectiveFrame, [72, 84], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
  };

  const labelProgress: PerVariety = {
    1: interpolate(effectiveFrame, [26, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    2: interpolate(effectiveFrame, [38, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    3: interpolate(effectiveFrame, [50, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    4: interpolate(effectiveFrame, [62, 74], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
    5: interpolate(effectiveFrame, [74, 86], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }),
  };

  // Strength for interactive selection
  const labelStrength: PerVariety = {
    1: selectedVariety === null || selectedVariety === 1 ? 1 : 0.3,
    2: selectedVariety === null || selectedVariety === 2 ? 1 : 0.3,
    3: selectedVariety === null || selectedVariety === 3 ? 1 : 0.3,
    4: selectedVariety === null || selectedVariety === 4 ? 1 : 0.3,
    5: selectedVariety === null || selectedVariety === 5 ? 1 : 0.3,
  };

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
      {/* Mode 3 Interactive Stepper Chips */}
      {mode === "interactive" && (
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
            {isPlayingTour ? "Playing..." : "▶ Walkthrough"}
          </button>
        </div>
      )}

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

export function mountAnimatedMap(mode: MapMode) {
  const figureEl = document.querySelector(".teaser figure");
  if (!figureEl) return;

  let mountContainer = document.getElementById("shams-remotion-map-mount");
  if (!mountContainer) {
    mountContainer = document.createElement("div");
    mountContainer.id = "shams-remotion-map-mount";
    
    // Hide static img, insert mount container before figcaption
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
  mapRoot.render(<AnimatedMap mode={mode} />);
}
