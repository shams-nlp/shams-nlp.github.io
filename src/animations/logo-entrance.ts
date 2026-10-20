import { interpolate } from "remotion";
import { EASE, POP, enter, f } from "../lib/scene";
import { SpeedOption, SPEED_PROFILES, SpeedConfig } from "../lib/speed-profiles";

export class LogoEntranceManager {
  private speed: SpeedOption = "medium";
  private isAnimating = false;
  private isDocked = false;
  private rafId: number | null = null;
  private overlayEl: HTMLElement | null = null;
  private lockupEl: HTMLElement | null = null;
  private skipBtnEl: HTMLElement | null = null;
  private targetSvg: SVGSVGElement | null = null;
  private brandEl: HTMLElement | null = null;
  private ruleEl: HTMLElement | null = null;

  constructor() {
    this.targetSvg = document.querySelector(".brand svg");
    this.brandEl = document.querySelector(".brand");
    this.ruleEl = document.querySelector("hr.rule");
  }

  public setSpeed(speed: SpeedOption) {
    this.speed = speed;
  }

  public getSpeed(): SpeedOption {
    return this.speed;
  }

  public start(speed: SpeedOption = this.speed) {
    this.speed = speed;
    this.cleanup();
    this.isDocked = false;
    this.isAnimating = true;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "instant" });

    // Hide native header items during intro
    if (this.brandEl) {
      this.brandEl.style.opacity = "0";
      this.brandEl.style.visibility = "hidden";
    }

    const venue = document.querySelector(".venue") as HTMLElement | null;
    const title = document.querySelector(".title") as HTMLElement | null;
    const authors = document.querySelector(".authors") as HTMLElement | null;
    const links = document.querySelector(".links") as HTMLElement | null;

    if (venue) venue.style.opacity = "0";
    if (title) title.style.opacity = "0";
    if (authors) authors.style.opacity = "0";
    if (links) links.style.opacity = "0";
    if (this.ruleEl) {
      this.ruleEl.style.transform = "scaleX(0)";
      this.ruleEl.style.transformOrigin = "0% 50%";
      this.ruleEl.style.transition = "none";
    }

    // Create fixed overlay
    this.overlayEl = document.createElement("div");
    this.overlayEl.id = "shams-intro-overlay";
    this.overlayEl.style.cssText = `
      position: fixed;
      inset: 0;
      background: var(--ivory, #FCF9F1);
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      transition: opacity 0.5s ease-out;
    `;

    // Create Skip button in upper right
    this.skipBtnEl = document.createElement("button");
    this.skipBtnEl.id = "shams-skip-btn";
    this.skipBtnEl.innerHTML = "Skip Intro ✕";
    this.skipBtnEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 24px;
      z-index: 10000;
      background: rgba(32, 28, 60, 0.08);
      border: 1px solid rgba(32, 28, 60, 0.15);
      border-radius: 14px;
      padding: 6px 14px;
      font-family: var(--head, "Inter Tight", sans-serif);
      font-size: 11px;
      font-weight: 600;
      color: var(--ink, #201C3C);
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.2s;
    `;
    this.skipBtnEl.addEventListener("click", () => this.dock());

    // Create centered lockup container
    this.lockupEl = document.createElement("div");
    this.lockupEl.id = "shams-intro-lockup";
    this.lockupEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 9999;
      pointer-events: none;
      will-change: transform, width, height, opacity;
      transform-origin: 50% 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      color: var(--ink, #201C3C);
      font-family: var(--head, "Inter Tight", sans-serif);
    `;

    this.lockupEl.innerHTML = `
      <div id="intro-mark-box" style="width: 100%; display: flex; justify-content: center; transform-origin: 50% 60%;">
        <svg viewBox="320 405 1160 540" width="100%" height="auto" style="display:block; overflow:visible;">
          <path fill="#201C3C" d="M586.06,828.74l31.93-25.45c-67.21-47.42-108.88-115.46-123.53-193.19h-52.47c13,84.32,68.48,176.33,144.07,218.64Z"/>
          <path fill="#201C3C" d="M668.91,779.94l29.99-22.49c-47.8-41.88-78.14-86.3-92.35-147.35h-50.47c15.81,68.77,56.09,128.34,112.82,169.84Z"/>
          <path fill="#201C3C" d="M1472.62,610.09h-53.76c-15.52,90.17-54.39,180.94-128.6,236.43-52.17,39-135.71,64.52-189.91,18.02-10.65-9.14-18.35-19.64-22.13-33.18-14.55-52.06-49.68-93.07-96.23-119.25-24.38-13.71-56.44-19.54-81.99-19.54s-57.59,6.11-81.99,19.54c-46.79,25.76-81.68,67.2-96.23,119.25-3.79,13.54-11.48,24.04-22.13,33.18-54.2,46.5-137.74,20.98-189.91-18.02-74.21-55.49-113.08-146.26-128.6-236.43h-53.76c31.08,232.84,182.32,327.01,299.1,327.01l273.52-.18,273.52.18c110.95,0,266.62-91.34,299.1-327.01ZM1029.61,883.58c-.33,5.96-3.9,8.47-10.95,8.45l-118.42-.31h0s-.25,0-.25,0h-.25s0,0,0,0l-118.42.31c-7.05.02-10.62-2.49-10.95-8.45-2.04-36.93,9.68-72.6,34.05-100.1,25.57-28.85,60.49-43.48,95.56-43.54,35.07.06,70,14.69,95.56,43.54,24.37,27.5,36.09,63.17,34.05,100.1Z"/>
          <path fill="#201C3C" d="M1213.39,828.74l-31.93-25.45c67.21-47.42,108.88-115.46,123.53-193.19h52.47c-13,84.32-68.48,176.33-144.07,218.64Z"/>
          <path fill="#201C3C" d="M1130.54,779.94l-29.99-22.49c47.8-41.88,78.14-86.3,92.35-147.35h50.47c-15.81,68.77-56.09,128.34-112.82,169.84Z"/>
          <circle fill="#E84226" cx="1332.76" cy="450.54" r="32.17"/>
          <circle fill="#E84226" cx="1266.9" cy="527.26" r="31.55"/>
          <circle fill="#E84226" cx="1398.57" cy="527.51" r="31.59"/>
        </svg>
      </div>
      <div id="intro-word" style="font-weight: 700; font-size: 64px; line-height: 1; letter-spacing: 0.01em; margin-top: 10px; opacity: 0; transform: translateY(16px);">
        SHAMS
      </div>
      <div id="intro-acronym" style="font-weight: 400; font-size: 16px; line-height: 1.35; margin-top: 8px; white-space: nowrap; display: flex; gap: 8px; justify-content: center;">
        <span class="acronym-word" id="ac-1" style="opacity: 0; transform: translateY(10px); display: inline-block;"><b style="font-weight:700; color:var(--flame, #E84226);">SH</b>ami</span>
        <span class="acronym-word" id="ac-2" style="opacity: 0; transform: translateY(10px); display: inline-block;"><b style="font-weight:700; color:var(--flame, #E84226);">A</b>nnotated</span>
        <span class="acronym-word" id="ac-3" style="opacity: 0; transform: translateY(10px); display: inline-block;"><b style="font-weight:700; color:var(--flame, #E84226);">M</b>ulti-dialect</span>
        <span class="acronym-word" id="ac-4" style="opacity: 0; transform: translateY(10px); display: inline-block;"><b style="font-weight:700; color:var(--flame, #E84226);">S</b>peech</span>
      </div>
    `;

    document.body.appendChild(this.overlayEl);
    document.body.appendChild(this.lockupEl);
    document.body.appendChild(this.skipBtnEl);

    this.runAnimationLoop();
  }

  private runAnimationLoop() {
    const config: SpeedConfig = SPEED_PROFILES[this.speed];
    const startTime = performance.now();

    // Cue timeline in seconds
    const t0 = 0;
    const t1 = t0 + config.markPopSec;                                // Mark pop completes
    const t2 = t1 + config.markHoldSec;                               // Mark alone hold ends, wordmark begins
    const t3 = t2 + config.wordmarkSec;                               // Wordmark reveal completes
    const t4 = t3 + config.wordHoldSec;                               // Brief hold before acronym
    const tWord1 = t4;
    const tWord2 = tWord1 + config.acronymGapSec;
    const tWord3 = tWord2 + config.acronymGapSec;
    const tWord4 = tWord3 + config.acronymGapSec;
    const tAcronymDone = tWord4 + config.acronymWordSec;
    const tGlideStart = tAcronymDone + config.readingHoldSec;          // Glide to header begins
    const tGlideEnd = tGlideStart + config.glideSec;                  // Flight completes and docks

    const markBox = this.lockupEl?.querySelector("#intro-mark-box") as HTMLElement | null;
    const introWord = this.lockupEl?.querySelector("#intro-word") as HTMLElement | null;
    const acWords = [
      this.lockupEl?.querySelector("#ac-1") as HTMLElement | null,
      this.lockupEl?.querySelector("#ac-2") as HTMLElement | null,
      this.lockupEl?.querySelector("#ac-3") as HTMLElement | null,
      this.lockupEl?.querySelector("#ac-4") as HTMLElement | null,
    ];

    const tick = (now: number) => {
      const elapsedSec = (now - startTime) / 1000;

      // Target position in header
      const targetRect = this.brandEl?.getBoundingClientRect() || {
        left: 40,
        top: 60,
        width: 250,
        height: 180,
      };

      // Centered initial position
      const startWidth = Math.min(window.innerWidth * 0.65, 400);
      const startHeight = (startWidth * 540) / 1160 + 120;
      const startX = window.innerWidth / 2 - startWidth / 2;
      const startY = window.innerHeight / 2 - startHeight / 2 - 20;

      const endX = targetRect.left;
      const endY = targetRect.top;
      const endWidth = targetRect.width;

      if (elapsedSec < tGlideStart) {
        // --- Centered Entrance Phases ---
        if (this.lockupEl) {
          this.lockupEl.style.width = `${startWidth}px`;
          this.lockupEl.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
        }

        // 1. Mark pop
        if (elapsedSec <= t1) {
          const p = Math.min(1, Math.max(0, (elapsedSec - t0) / config.markPopSec));
          const popEased = POP(p);
          const scale = interpolate(popEased, [0, 1], [0.5, 1]);
          const opacity = Math.min(1, p * 3);
          if (markBox) {
            markBox.style.transform = `scale(${scale})`;
            markBox.style.opacity = `${opacity}`;
          }
        } else {
          if (markBox) {
            markBox.style.transform = "scale(1)";
            markBox.style.opacity = "1";
          }
        }

        // 2. Wordmark "SHAMS"
        if (elapsedSec >= t2 && introWord) {
          const p = Math.min(1, Math.max(0, (elapsedSec - t2) / config.wordmarkSec));
          const eased = EASE(p);
          introWord.style.opacity = `${p}`;
          introWord.style.transform = `translateY(${(1 - eased) * 16}px)`;
        }

        // 3. Acronym words: word after word
        const wordStarts = [tWord1, tWord2, tWord3, tWord4];
        acWords.forEach((wEl, idx) => {
          if (!wEl) return;
          const wStart = wordStarts[idx];
          if (elapsedSec >= wStart) {
            const p = Math.min(1, Math.max(0, (elapsedSec - wStart) / config.acronymWordSec));
            const eased = EASE(p);
            wEl.style.opacity = `${p}`;
            wEl.style.transform = `translateY(${(1 - eased) * 10}px)`;
          }
        });
      } else if (elapsedSec < tGlideEnd) {
        // --- Glide / Docking Phase ---
        const glideProgress = Math.min(1, Math.max(0, (elapsedSec - tGlideStart) / config.glideSec));
        const easedGlide = EASE(glideProgress);

        const curX = interpolate(easedGlide, [0, 1], [startX, endX]);
        const curY = interpolate(easedGlide, [0, 1], [startY, endY]);
        const curW = interpolate(easedGlide, [0, 1], [startWidth, endWidth]);

        // Font scaling during glide
        const targetWordSize = window.innerWidth <= 840 ? 34 : 64;
        const targetAcronymSize = window.innerWidth <= 840 ? 10 : 13;
        const curWordSize = interpolate(easedGlide, [0, 1], [64, targetWordSize]);
        const curAcronymSize = interpolate(easedGlide, [0, 1], [16, targetAcronymSize]);

        if (this.lockupEl) {
          this.lockupEl.style.width = `${curW}px`;
          this.lockupEl.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
        }
        if (introWord) {
          introWord.style.fontSize = `${curWordSize}px`;
          introWord.style.marginTop = `${interpolate(easedGlide, [0, 1], [10, 2])}px`;
        }
        if (this.lockupEl?.querySelector("#intro-acronym")) {
          const ac = this.lockupEl.querySelector("#intro-acronym") as HTMLElement;
          ac.style.fontSize = `${curAcronymSize}px`;
          ac.style.marginTop = `${interpolate(easedGlide, [0, 1], [8, 4])}px`;
        }

        // Reveal header and site as it glides
        this.updateHeaderProgress(easedGlide);

        if (this.overlayEl) {
          this.overlayEl.style.opacity = `${1 - easedGlide}`;
        }
      } else {
        // Done
        this.dock();
        return;
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);

    // Fast-forward on user scroll
    const onUserScroll = () => {
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchstart", onUserScroll);
      this.dock();
    };
    window.addEventListener("wheel", onUserScroll, { passive: true, once: true });
    window.addEventListener("touchstart", onUserScroll, { passive: true, once: true });
  }

  private updateHeaderProgress(progress: number) {
    const venue = document.querySelector(".venue") as HTMLElement | null;
    const title = document.querySelector(".title") as HTMLElement | null;
    const authors = document.querySelector(".authors") as HTMLElement | null;
    const links = document.querySelector(".links") as HTMLElement | null;

    if (venue) {
      const p = interpolate(progress, [0.15, 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      venue.style.opacity = `${p}`;
      venue.style.transform = `translateY(${(1 - p) * 16}px)`;
    }
    if (title) {
      const p = interpolate(progress, [0.3, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      title.style.opacity = `${p}`;
      title.style.transform = `translateY(${(1 - p) * 20}px)`;
    }
    if (this.ruleEl) {
      const p = interpolate(progress, [0.4, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      this.ruleEl.style.transform = `scaleX(${p})`;
    }
    if (authors) {
      const p = interpolate(progress, [0.55, 0.95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      authors.style.opacity = `${p}`;
      authors.style.transform = `translateY(${(1 - p) * 14}px)`;
    }
    if (links) {
      const p = interpolate(progress, [0.7, 1.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      links.style.opacity = `${p}`;
      links.style.transform = `translateY(${(1 - p) * 12}px)`;
    }
  }

  public dock() {
    this.isDocked = true;
    this.isAnimating = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);

    // Make native brand visible
    if (this.brandEl) {
      this.brandEl.style.opacity = "1";
      this.brandEl.style.visibility = "visible";
    }

    const venue = document.querySelector(".venue") as HTMLElement | null;
    const title = document.querySelector(".title") as HTMLElement | null;
    const authors = document.querySelector(".authors") as HTMLElement | null;
    const links = document.querySelector(".links") as HTMLElement | null;

    if (venue) { venue.style.opacity = "1"; venue.style.transform = "none"; }
    if (title) { title.style.opacity = "1"; title.style.transform = "none"; }
    if (authors) { authors.style.opacity = "1"; authors.style.transform = "none"; }
    if (links) { links.style.opacity = "1"; links.style.transform = "none"; }
    if (this.ruleEl) { this.ruleEl.style.transform = "scaleX(1)"; }

    this.cleanup();
  }

  private cleanup() {
    if (this.lockupEl && this.lockupEl.parentNode) {
      this.lockupEl.parentNode.removeChild(this.lockupEl);
      this.lockupEl = null;
    }
    if (this.skipBtnEl && this.skipBtnEl.parentNode) {
      this.skipBtnEl.parentNode.removeChild(this.skipBtnEl);
      this.skipBtnEl = null;
    }
    if (this.overlayEl && this.overlayEl.parentNode) {
      this.overlayEl.parentNode.removeChild(this.overlayEl);
      this.overlayEl = null;
    }
  }
}
