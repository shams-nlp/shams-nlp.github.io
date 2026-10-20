export type SpeedOption = "slow" | "medium" | "fast";

export interface SpeedConfig {
  id: SpeedOption;
  name: string;
  badge: string;
  tagline: string;
  // Intro timings in seconds
  markPopSec: number;        // Calligraphic logo pops in alone
  markHoldSec: number;       // Logo holds alone centered
  wordmarkSec: number;       // "SHAMS" wordmark rises in
  wordHoldSec: number;       // Brief beat before acronym
  acronymWordSec: number;    // Each word in acronym entrance duration
  acronymGapSec: number;     // Stagger between words
  readingHoldSec: number;    // Hold full lockup for reading
  glideSec: number;          // Glide/dock to navbar brand
  totalIntroSec: number;     // Total duration in seconds
  // Section scroll reveal timings
  mapDurationSec: number;    // Fig 1 map reveal duration
  tiersDurationSec: number;  // Fig 2 tiers cascade duration
}

export function getTotalIntroDurationSec(config: SpeedConfig): number {
  return (
    config.markPopSec +
    config.markHoldSec +
    config.wordmarkSec +
    config.wordHoldSec +
    3 * config.acronymGapSec +
    config.acronymWordSec +
    config.readingHoldSec +
    config.glideSec
  );
}

export const SPEED_PROFILES: Record<SpeedOption, SpeedConfig> = {
  slow: {
    id: "slow",
    name: "Option A: Deliberate (Slow)",
    badge: "Slow ~7.8s",
    tagline: "Unrushed cinematic reveal: generous time for calligraphy, wordmark, and each acronym word",
    markPopSec: 1.2,
    markHoldSec: 0.7,
    wordmarkSec: 0.8,
    wordHoldSec: 0.4,
    acronymWordSec: 0.45,
    acronymGapSec: 0.45,
    readingHoldSec: 1.5,
    glideSec: 1.4,
    totalIntroSec: 7.8,
    mapDurationSec: 8.5,
    tiersDurationSec: 3.5,
  },
  medium: {
    id: "medium",
    name: "Option B: Balanced (Medium)",
    badge: "Medium ~5.2s",
    tagline: "Natural editorial pacing: clear word-by-word reveal and smooth docking glide",
    markPopSec: 0.8,
    markHoldSec: 0.4,
    wordmarkSec: 0.55,
    wordHoldSec: 0.25,
    acronymWordSec: 0.3,
    acronymGapSec: 0.3,
    readingHoldSec: 0.9,
    glideSec: 1.1,
    totalIntroSec: 5.2,
    mapDurationSec: 6.8,
    tiersDurationSec: 2.4,
  },
  fast: {
    id: "fast",
    name: "Option C: Brisk (Fast)",
    badge: "Fast 2.0s",
    tagline: "Snappy modern reveal: 2.0s entrance flight to header",
    markPopSec: 0.35,
    markHoldSec: 0.10,
    wordmarkSec: 0.25,
    wordHoldSec: 0.10,
    acronymWordSec: 0.15,
    acronymGapSec: 0.10,
    readingHoldSec: 0.15,
    glideSec: 0.60,
    totalIntroSec: 2.0,
    mapDurationSec: 5.6,
    tiersDurationSec: 1.6,
  },
};
