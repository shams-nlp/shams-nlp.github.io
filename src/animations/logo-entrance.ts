import { interpolate } from "remotion";
import { EASE, POP, enter } from "../lib/scene";
import { SpeedOption, SPEED_PROFILES, SpeedConfig } from "../lib/speed-profiles";

export class LogoEntranceManager {
  private speed: SpeedOption = "fast";
  private isAnimating = false;
  private isDocked = false;
  private rafId: number | null = null;
  private overlayEl: HTMLElement | null = null;
  private lockupEl: HTMLElement | null = null;
  private brandEl: HTMLElement | null = null;
  private ruleEl: HTMLElement | null = null;

  constructor() {
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

    // Hide native header items during intro (visibility: hidden keeps layout dimensions intact)
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
      transition: opacity 0.4s ease-out;
    `;

    // Query exact layout metrics from .brand
    const targetWord = this.brandEl?.querySelector(".word") as HTMLElement | null;
    const targetExp = this.brandEl?.querySelector(".exp") as HTMLElement | null;

    const wordComputed = targetWord ? window.getComputedStyle(targetWord) : null;
    const expComputed = targetExp ? window.getComputedStyle(targetExp) : null;

    const targetWordFontSize = wordComputed ? parseFloat(wordComputed.fontSize) : (window.innerWidth <= 640 ? 60 : (window.innerWidth <= 900 ? 34 : 64));
    const targetWordMarginTop = wordComputed ? parseFloat(wordComputed.marginTop) : 2;
    const targetWordLineHeight = wordComputed ? wordComputed.lineHeight : "1";
    const targetWordLetterSpacing = wordComputed ? wordComputed.letterSpacing : "0.01em";

    const targetExpFontSize = expComputed ? parseFloat(expComputed.fontSize) : (window.innerWidth <= 900 && window.innerWidth > 640 ? 10 : 13);
    const targetExpMarginTop = expComputed ? parseFloat(expComputed.marginTop) : 8;
    const targetExpLineHeight = expComputed ? expComputed.lineHeight : "1.3";
    const targetExpLetterSpacing = expComputed ? expComputed.letterSpacing : "normal";

    const startWidth = Math.min(window.innerWidth * 0.72, 400);
    const startHeight = (startWidth * 540) / 1160 + 120;
    const startX = window.innerWidth / 2 - startWidth / 2;
    const startY = window.innerHeight / 2 - startHeight / 2 - 20;

    const startWordSize = Math.min(64, Math.max(38, Math.round(startWidth * 0.2)));
    const startWordMarginTop = 10;
    const startAcronymSize = Math.min(16, Math.max(12, Math.round(startWidth * 0.046)));
    const startAcronymMarginTop = 8;

    // Create centered lockup container with display: block & text-align: center to match .brand layout exactly
    this.lockupEl = document.createElement("div");
    this.lockupEl.id = "shams-intro-lockup";
    this.lockupEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 9999;
      pointer-events: none;
      will-change: transform, width, opacity;
      transform-origin: 50% 50%;
      display: block;
      text-align: center;
      color: var(--ink, #201C3C);
      font-family: var(--head, "Inter Tight", sans-serif);
      width: ${startWidth}px;
      transform: translate3d(${startX}px, ${startY}px, 0);
    `;

    this.lockupEl.innerHTML = `
      <div id="intro-mark-box" style="width: 100%; display: block; transform-origin: 50% 60%;">
        <svg viewBox="0 0 1160 540" style="width: 100%; height: auto; display: block;"><use href="#mark"/></svg>
      </div>
      <span id="intro-word" class="word" style="display: block; font-weight: 700; font-size: ${startWordSize}px; line-height: ${targetWordLineHeight}; letter-spacing: ${targetWordLetterSpacing}; margin-top: ${startWordMarginTop}px; opacity: 0; transform: translateY(16px); text-align: center;">
        SHAMS
      </span>
      <span id="intro-acronym" class="exp" style="display: block; white-space: nowrap; font-weight: 400; font-size: ${startAcronymSize}px; line-height: ${targetExpLineHeight}; letter-spacing: ${targetExpLetterSpacing}; margin-top: ${startAcronymMarginTop}px; text-align: center; color: var(--ink, #201C3C);">
        <span class="acronym-word" id="ac-1" style="display: inline-block; opacity: 0; transform: translateY(10px);"><b style="font-weight: 700; color: var(--flame, #E84226);">SH</b>ami</span> <span class="acronym-word" id="ac-2" style="display: inline-block; opacity: 0; transform: translateY(10px);"><b style="font-weight: 700; color: var(--flame, #E84226);">A</b>nnotated</span> <span class="acronym-word" id="ac-3" style="display: inline-block; opacity: 0; transform: translateY(10px);"><b style="font-weight: 700; color: var(--flame, #E84226);">M</b>ulti-dialect</span> <span class="acronym-word" id="ac-4" style="display: inline-block; opacity: 0; transform: translateY(10px);"><b style="font-weight: 700; color: var(--flame, #E84226);">S</b>peech</span>
      </span>
    `;

    document.body.appendChild(this.overlayEl);
    document.body.appendChild(this.lockupEl);

    this.runAnimationLoop(
      startX,
      startY,
      startWidth,
      startWordSize,
      startWordMarginTop,
      startAcronymSize,
      startAcronymMarginTop
    );
  }

  private runAnimationLoop(
    startX: number,
    startY: number,
    startWidth: number,
    startWordSize: number,
    startWordMarginTop: number,
    startAcronymSize: number,
    startAcronymMarginTop: number
  ) {
    const config: SpeedConfig = SPEED_PROFILES[this.speed];
    const startTime = performance.now();

    const t0 = 0;
    const t1 = t0 + config.markPopSec;                                
    const t2 = t1 + config.markHoldSec;                               
    const t3 = t2 + config.wordmarkSec;                               
    const t4 = t3 + config.wordHoldSec;                               
    const tWord1 = t4;
    const tWord2 = tWord1 + config.acronymGapSec;
    const tWord3 = tWord2 + config.acronymGapSec;
    const tWord4 = tWord3 + config.acronymGapSec;
    const tAcronymDone = tWord4 + config.acronymWordSec;
    const tGlideStart = tAcronymDone + config.readingHoldSec;          
    const tGlideEnd = tGlideStart + config.glideSec;                  

    const markBox = this.lockupEl?.querySelector("#intro-mark-box") as HTMLElement | null;
    const introWord = this.lockupEl?.querySelector("#intro-word") as HTMLElement | null;
    const introAcronym = this.lockupEl?.querySelector("#intro-acronym") as HTMLElement | null;
    const acWords = [
      this.lockupEl?.querySelector("#ac-1") as HTMLElement | null,
      this.lockupEl?.querySelector("#ac-2") as HTMLElement | null,
      this.lockupEl?.querySelector("#ac-3") as HTMLElement | null,
      this.lockupEl?.querySelector("#ac-4") as HTMLElement | null,
    ];

    const getTargetMetrics = () => {
      const rect = this.brandEl?.getBoundingClientRect() || { left: 48, top: 56, width: 250, height: 207 };
      const targetWord = this.brandEl?.querySelector(".word") as HTMLElement | null;
      const targetExp = this.brandEl?.querySelector(".exp") as HTMLElement | null;
      const wordStyle = targetWord ? window.getComputedStyle(targetWord) : null;
      const expStyle = targetExp ? window.getComputedStyle(targetExp) : null;

      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        wordFontSize: wordStyle ? parseFloat(wordStyle.fontSize) : (window.innerWidth <= 640 ? 60 : (window.innerWidth <= 900 ? 34 : 64)),
        wordMarginTop: wordStyle ? parseFloat(wordStyle.marginTop) : 2,
        wordLineHeight: wordStyle ? wordStyle.lineHeight : "1",
        wordLetterSpacing: wordStyle ? wordStyle.letterSpacing : "0.01em",
        expFontSize: expStyle ? parseFloat(expStyle.fontSize) : (window.innerWidth <= 900 && window.innerWidth > 640 ? 10 : 13),
        expMarginTop: expStyle ? parseFloat(expStyle.marginTop) : 8,
        expLineHeight: expStyle ? expStyle.lineHeight : "1.3",
        expLetterSpacing: expStyle ? expStyle.letterSpacing : "normal",
      };
    };

    const tick = (now: number) => {
      const elapsedSec = (now - startTime) / 1000;
      const targetMetrics = getTargetMetrics();

      const endX = targetMetrics.left;
      const endY = targetMetrics.top;
      const endWidth = targetMetrics.width;

      if (elapsedSec < tGlideStart) {
        if (this.lockupEl) {
          this.lockupEl.style.width = `${startWidth}px`;
          this.lockupEl.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
        }

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

        if (elapsedSec >= t2 && introWord) {
          const p = Math.min(1, Math.max(0, (elapsedSec - t2) / config.wordmarkSec));
          const eased = EASE(p);
          introWord.style.opacity = `${p}`;
          introWord.style.transform = `translateY(${(1 - eased) * 16}px)`;
        }

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
        const glideProgress = Math.min(1, Math.max(0, (elapsedSec - tGlideStart) / config.glideSec));
        const easedGlide = EASE(glideProgress);

        const curX = interpolate(easedGlide, [0, 1], [startX, endX]);
        const curY = interpolate(easedGlide, [0, 1], [startY, endY]);
        const curW = interpolate(easedGlide, [0, 1], [startWidth, endWidth]);

        const curWordSize = interpolate(easedGlide, [0, 1], [startWordSize, targetMetrics.wordFontSize]);
        const curWordMarginTop = interpolate(easedGlide, [0, 1], [startWordMarginTop, targetMetrics.wordMarginTop]);
        const curAcronymSize = interpolate(easedGlide, [0, 1], [startAcronymSize, targetMetrics.expFontSize]);
        const curAcronymMarginTop = interpolate(easedGlide, [0, 1], [startAcronymMarginTop, targetMetrics.expMarginTop]);

        if (this.lockupEl) {
          this.lockupEl.style.width = `${curW}px`;
          this.lockupEl.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
        }
        if (introWord) {
          introWord.style.fontSize = `${curWordSize}px`;
          introWord.style.marginTop = `${curWordMarginTop}px`;
          introWord.style.lineHeight = targetMetrics.wordLineHeight;
          introWord.style.letterSpacing = targetMetrics.wordLetterSpacing;
        }
        if (introAcronym) {
          introAcronym.style.fontSize = `${curAcronymSize}px`;
          introAcronym.style.marginTop = `${curAcronymMarginTop}px`;
          introAcronym.style.lineHeight = targetMetrics.expLineHeight;
          introAcronym.style.letterSpacing = targetMetrics.expLetterSpacing;
        }

        this.updateHeaderProgress(easedGlide);

        if (this.overlayEl) {
          this.overlayEl.style.opacity = `${1 - easedGlide}`;
        }
      } else {
        // Glide finished - snap lockup to exact final metrics right before docking
        if (this.lockupEl) {
          this.lockupEl.style.width = `${endWidth}px`;
          this.lockupEl.style.transform = `translate3d(${endX}px, ${endY}px, 0)`;
        }
        if (introWord) {
          introWord.style.fontSize = `${targetMetrics.wordFontSize}px`;
          introWord.style.marginTop = `${targetMetrics.wordMarginTop}px`;
          introWord.style.transform = "none";
          introWord.style.opacity = "1";
        }
        if (introAcronym) {
          introAcronym.style.fontSize = `${targetMetrics.expFontSize}px`;
          introAcronym.style.marginTop = `${targetMetrics.expMarginTop}px`;
          acWords.forEach((w) => {
            if (w) {
              w.style.transform = "none";
              w.style.opacity = "1";
            }
          });
        }
        this.updateHeaderProgress(1);
        this.dock();
        return;
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);

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

    // Make target .brand visible first so there is zero flash of missing content
    if (this.brandEl) {
      this.brandEl.style.visibility = "visible";
      this.brandEl.style.opacity = "1";
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
    if (this.overlayEl && this.overlayEl.parentNode) {
      this.overlayEl.parentNode.removeChild(this.overlayEl);
      this.overlayEl = null;
    }
  }
}
