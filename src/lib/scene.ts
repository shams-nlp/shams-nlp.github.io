import { Easing, interpolate } from "remotion";
import { C, F } from "./theme";

export const W = 1920;
export const H = 1080;
export const FPS = 30;

/** The default easing of the talk: fast start, soft landing. */
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
/** For a small pop with overshoot (icons, dots). */
export const POP = Easing.bezier(0.34, 1.56, 0.64, 1);

/** 0 to 1 from `start` over `dur` frames, eased and clamped. */
export const enter = (frame: number, start: number, dur = 18, easing = EASE): number =>
  interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** Style of an element that fades in and rises `rise` px. */
export const riseIn = (frame: number, start: number, dur = 18, rise = 16): { opacity: number; transform: string } => {
  const p = enter(frame, start, dur);
  return { opacity: p, transform: `translateY(${(1 - p) * rise}px)` };
};

/** Clip that wipes content in along its reading direction. */
export const wipe = (frame: number, start: number, dur = 24, rtl = false): { clipPath: string } => {
  const p = enter(frame, start, dur);
  return { clipPath: rtl ? `inset(-20% 0 -20% ${(1 - p) * 100}%)` : `inset(-20% ${(1 - p) * 100}% -20% 0)` };
};

/** Seconds to frames. */
export const f = (seconds: number, fps = FPS): number => Math.round(seconds * fps);
