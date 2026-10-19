import { interpolate, Easing } from "remotion";
import { EASE, POP, enter, riseIn } from "../lib/scene";

export interface LogoEntranceConfig {
  mode: "autonomous" | "scrollytelling" | "interactive";
  onComplete?: () => void;
}

export class LogoEntranceManager {
  private mode: "autonomous" | "scrollytelling" | "interactive" = "autonomous";
  private isAnimating = false;
  private isDocked = false;
  private rafId: number | null = null;
  private overlayEl: HTMLElement | null = null;
  private flyingMarkEl: HTMLElement | null = null;
  private targetSvg: SVGSVGElement | null = null;
  private brandEl: HTMLElement | null = null;
  private heroGridEl: HTMLElement | null = null;
  private ruleEl: HTMLElement | null = null;
  private mainEl: HTMLElement | null = null;

  constructor() {
    this.targetSvg = document.querySelector(".brand svg");
    this.brandEl = document.querySelector(".brand");
    this.heroGridEl = document.querySelector(".hero-grid");
    this.ruleEl = document.querySelector("hr.rule");
    this.mainEl = document.querySelector("main");
  }

  public setMode(mode: "autonomous" | "scrollytelling" | "interactive") {
    this.mode = mode;
  }

  public start(mode: "autonomous" | "scrollytelling" | "interactive" = this.mode) {
    this.mode = mode;
    this.cleanup();
    this.isDocked = false;
    this.isAnimating = true;

    // Scroll to top on fresh start
    window.scrollTo({ top: 0, behavior: "instant" });

    // Hide native header items while flying mark is active
    if (this.targetSvg) {
      this.targetSvg.style.visibility = "hidden";
    }

    const word = this.brandEl?.querySelector(".word") as HTMLElement | null;
    const exp = this.brandEl?.querySelector(".exp") as HTMLElement | null;
    const venue = document.querySelector(".venue") as HTMLElement | null;
    const title = document.querySelector(".title") as HTMLElement | null;
    const authors = document.querySelector(".authors") as HTMLElement | null;
    const links = document.querySelector(".links") as HTMLElement | null;

    if (word) word.style.opacity = "0";
    if (exp) exp.style.opacity = "0";
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

    // Create flying mark
    this.flyingMarkEl = document.createElement("div");
    this.flyingMarkEl.id = "shams-flying-mark";
    this.flyingMarkEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100px;
      height: 50px;
      z-index: 9999;
      pointer-events: none;
      will-change: transform, width, height, opacity;
      transform-origin: 50% 50%;
    `;

    this.flyingMarkEl.innerHTML = `
      <svg viewBox="320 405 1160 540" width="100%" height="100%" style="display:block; overflow:visible;">
        <path fill="#201C3C" d="M586.06,828.74l31.93-25.45c-67.21-47.42-108.88-115.46-123.53-193.19h-52.47c13,84.32,68.48,176.33,144.07,218.64Z"/>
        <path fill="#201C3C" d="M668.91,779.94l29.99-22.49c-47.8-41.88-78.14-86.3-92.35-147.35h-50.47c15.81,68.77,56.09,128.34,112.82,169.84Z"/>
        <path fill="#201C3C" d="M1472.62,610.09h-53.76c-15.52,90.17-54.39,180.94-128.6,236.43-52.17,39-135.71,64.52-189.91,18.02-10.65-9.14-18.35-19.64-22.13-33.18-14.55-52.06-49.68-93.07-96.23-119.25-24.38-13.71-56.44-19.54-81.99-19.54s-57.59,6.11-81.99,19.54c-46.79,25.76-81.68,67.2-96.23,119.25-3.79,13.54-11.48,24.04-22.13,33.18-54.2,46.5-137.74,20.98-189.91-18.02-74.21-55.49-113.08-146.26-128.6-236.43h-53.76c31.08,232.84,182.32,327.01,299.1,327.01l273.52-.18,273.52.18c110.95,0,266.62-91.34,299.1-327.01ZM1029.61,883.58c-.33,5.96-3.9,8.47-10.95,8.45l-118.42-.31h0s-.25,0-.25,0h-.25s0,0,0,0l-118.42.31c-7.05.02-10.62-2.49-10.95-8.45-2.04-36.93,9.68-72.6,34.05-100.1,25.57-28.85,60.49-43.48,95.56-43.54,35.07.06,70,14.69,95.56,43.54,24.37,27.5,36.09,63.17,34.05,100.1Z"/>
        <path fill="#201C3C" d="M1213.39,828.74l-31.93-25.45c67.21-47.42,108.88-115.46,123.53-193.19h52.47c-13,84.32-68.48,176.33-144.07,218.64Z"/>
        <path fill="#201C3C" d="M1130.54,779.94l-29.99-22.49c47.8-41.88,78.14-86.3,92.35-147.35h50.47c-15.81,68.77-56.09,128.34-112.82,169.84Z"/>
        <circle fill="#E84226" cx="1332.76" cy="450.54" r="32.17"/>
        <circle fill="#E84226" cx="1266.9" cy="527.26" r="31.55"/>
        <circle fill="#E84226" cx="1398.57" cy="527.51" r="31.59"/>
      </svg>
    `;

    document.body.appendChild(this.overlayEl);
    document.body.appendChild(this.flyingMarkEl);

    if (this.mode === "scrollytelling") {
      this.runScrollytellingLoop();
    } else {
      this.runAutonomousLoop();
    }
  }

  private runAutonomousLoop() {
    let frame = 0;
    const totalPopFrames = 22; // ~700ms pop
    const holdFrames = this.mode === "interactive" ? 10 : 20; // brief hold
    const travelFrames = 30; // ~1000ms travel

    const tick = () => {
      frame++;

      const targetRect = this.targetSvg?.getBoundingClientRect() || {
        left: 40,
        top: 60,
        width: 250,
        height: 116,
      };

      const startWidth = Math.min(window.innerWidth * 0.65, 420);
      const startHeight = (startWidth * 540) / 1160;
      const startX = window.innerWidth / 2 - startWidth / 2;
      const startY = window.innerHeight / 2 - startHeight / 2;

      const endX = targetRect.left;
      const endY = targetRect.top;
      const endWidth = targetRect.width;
      const endHeight = targetRect.height;

      if (frame <= totalPopFrames) {
        // Pop in center
        const p = enter(frame, 0, totalPopFrames, POP);
        const scale = interpolate(p, [0, 1], [0.55, 1]);
        const opacity = Math.min(1, p * 2.5);

        if (this.flyingMarkEl) {
          this.flyingMarkEl.style.width = `${startWidth}px`;
          this.flyingMarkEl.style.height = `${startHeight}px`;
          this.flyingMarkEl.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(${scale})`;
          this.flyingMarkEl.style.opacity = `${opacity}`;
        }
      } else if (frame <= totalPopFrames + holdFrames) {
        // Hold centered
        if (this.flyingMarkEl) {
          this.flyingMarkEl.style.width = `${startWidth}px`;
          this.flyingMarkEl.style.height = `${startHeight}px`;
          this.flyingMarkEl.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(1)`;
          this.flyingMarkEl.style.opacity = `1`;
        }
      } else if (frame <= totalPopFrames + holdFrames + travelFrames) {
        // Travel to header position
        const travelStart = totalPopFrames + holdFrames;
        const progress = enter(frame, travelStart, travelFrames, EASE);

        const curX = interpolate(progress, [0, 1], [startX, endX]);
        const curY = interpolate(progress, [0, 1], [startY, endY]);
        const curW = interpolate(progress, [0, 1], [startWidth, endWidth]);
        const curH = interpolate(progress, [0, 1], [startHeight, endHeight]);

        if (this.flyingMarkEl) {
          this.flyingMarkEl.style.width = `${curW}px`;
          this.flyingMarkEl.style.height = `${curH}px`;
          this.flyingMarkEl.style.transform = `translate3d(${curX}px, ${curY}px, 0) scale(1)`;
        }

        // Stagger in header items
        this.updateHeaderProgress(progress);

        // Fade backdrop overlay
        if (this.overlayEl) {
          this.overlayEl.style.opacity = `${1 - progress}`;
        }
      } else {
        // Complete docking
        this.dock();
        return;
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);

    // Fast-forward if user scrolls during intro
    const onUserScroll = () => {
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchstart", onUserScroll);
      if (frame < totalPopFrames + holdFrames) {
        frame = totalPopFrames + holdFrames;
      }
    };
    window.addEventListener("wheel", onUserScroll, { passive: true, once: true });
    window.addEventListener("touchstart", onUserScroll, { passive: true, once: true });
  }

  private runScrollytellingLoop() {
    // Initial pop
    let popFrame = 0;
    const popTicks = 18;

    const popLoop = () => {
      popFrame++;
      const p = enter(popFrame, 0, popTicks, POP);
      const scale = interpolate(p, [0, 1], [0.6, 1]);

      const startWidth = Math.min(window.innerWidth * 0.65, 420);
      const startHeight = (startWidth * 540) / 1160;
      const startX = window.innerWidth / 2 - startWidth / 2;
      const startY = window.innerHeight / 2 - startHeight / 2;

      if (this.flyingMarkEl) {
        this.flyingMarkEl.style.width = `${startWidth}px`;
        this.flyingMarkEl.style.height = `${startHeight}px`;
        this.flyingMarkEl.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(${scale})`;
        this.flyingMarkEl.style.opacity = `${p}`;
      }

      if (popFrame < popTicks) {
        requestAnimationFrame(popLoop);
      } else {
        this.attachScrollScrub();
      }
    };

    requestAnimationFrame(popLoop);
  }

  private attachScrollScrub() {
    const handleScroll = () => {
      if (this.isDocked) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const scrubDist = 260; // 260px scroll completes flight
      const progress = Math.min(1, Math.max(0, scrollY / scrubDist));

      const targetRect = this.targetSvg?.getBoundingClientRect() || {
        left: 40,
        top: 60,
        width: 250,
        height: 116,
      };

      const startWidth = Math.min(window.innerWidth * 0.65, 420);
      const startHeight = (startWidth * 540) / 1160;
      const startX = window.innerWidth / 2 - startWidth / 2;
      const startY = window.innerHeight / 2 - startHeight / 2;

      const endX = targetRect.left;
      const endY = targetRect.top;
      const endWidth = targetRect.width;
      const endHeight = targetRect.height;

      const eased = EASE(progress);
      const curX = interpolate(eased, [0, 1], [startX, endX]);
      const curY = interpolate(eased, [0, 1], [startY, endY]);
      const curW = interpolate(eased, [0, 1], [startWidth, endWidth]);
      const curH = interpolate(eased, [0, 1], [startHeight, endHeight]);

      if (this.flyingMarkEl) {
        this.flyingMarkEl.style.width = `${curW}px`;
        this.flyingMarkEl.style.height = `${curH}px`;
        this.flyingMarkEl.style.transform = `translate3d(${curX}px, ${curY}px, 0) scale(1)`;
      }

      this.updateHeaderProgress(eased);

      if (this.overlayEl) {
        this.overlayEl.style.opacity = `${1 - eased}`;
      }

      if (progress >= 1) {
        this.dock();
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  private updateHeaderProgress(progress: number) {
    const word = this.brandEl?.querySelector(".word") as HTMLElement | null;
    const exp = this.brandEl?.querySelector(".exp") as HTMLElement | null;
    const venue = document.querySelector(".venue") as HTMLElement | null;
    const title = document.querySelector(".title") as HTMLElement | null;
    const authors = document.querySelector(".authors") as HTMLElement | null;
    const links = document.querySelector(".links") as HTMLElement | null;

    // Wordmark & expansion line rise in around progress 0.4 - 0.7
    if (word) {
      const p = interpolate(progress, [0.35, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      word.style.opacity = `${p}`;
      word.style.transform = `translateY(${(1 - p) * 16}px)`;
    }
    if (exp) {
      const p = interpolate(progress, [0.45, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      exp.style.opacity = `${p}`;
      exp.style.transform = `translateY(${(1 - p) * 12}px)`;
    }

    // Venue & title lines rise in around progress 0.5 - 0.85
    if (venue) {
      const p = interpolate(progress, [0.4, 0.75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      venue.style.opacity = `${p}`;
      venue.style.transform = `translateY(${(1 - p) * 16}px)`;
    }
    if (title) {
      const p = interpolate(progress, [0.5, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      title.style.opacity = `${p}`;
      title.style.transform = `translateY(${(1 - p) * 20}px)`;
    }

    // Dividing rule draws from left to right around progress 0.6 - 0.95
    if (this.ruleEl) {
      const p = interpolate(progress, [0.55, 0.95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      this.ruleEl.style.transform = `scaleX(${p})`;
    }

    // Authors & Links fade in around progress 0.7 - 1.0
    if (authors) {
      const p = interpolate(progress, [0.7, 1.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      authors.style.opacity = `${p}`;
      authors.style.transform = `translateY(${(1 - p) * 16}px)`;
    }
    if (links) {
      const p = interpolate(progress, [0.8, 1.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      links.style.opacity = `${p}`;
      links.style.transform = `translateY(${(1 - p) * 14}px)`;
    }
  }

  public dock() {
    this.isDocked = true;
    this.isAnimating = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);

    // Make target mark visible
    if (this.targetSvg) {
      this.targetSvg.style.visibility = "visible";
    }

    // Reset styles on header elements to fully revealed
    const word = this.brandEl?.querySelector(".word") as HTMLElement | null;
    const exp = this.brandEl?.querySelector(".exp") as HTMLElement | null;
    const venue = document.querySelector(".venue") as HTMLElement | null;
    const title = document.querySelector(".title") as HTMLElement | null;
    const authors = document.querySelector(".authors") as HTMLElement | null;
    const links = document.querySelector(".links") as HTMLElement | null;

    if (word) { word.style.opacity = "1"; word.style.transform = "none"; }
    if (exp) { exp.style.opacity = "1"; exp.style.transform = "none"; }
    if (venue) { venue.style.opacity = "1"; venue.style.transform = "none"; }
    if (title) { title.style.opacity = "1"; title.style.transform = "none"; }
    if (authors) { authors.style.opacity = "1"; authors.style.transform = "none"; }
    if (links) { links.style.opacity = "1"; links.style.transform = "none"; }
    if (this.ruleEl) { this.ruleEl.style.transform = "scaleX(1)"; }

    // Remove flying mark and overlay
    this.cleanup();
  }

  private cleanup() {
    if (this.flyingMarkEl && this.flyingMarkEl.parentNode) {
      this.flyingMarkEl.parentNode.removeChild(this.flyingMarkEl);
      this.flyingMarkEl = null;
    }
    if (this.overlayEl && this.overlayEl.parentNode) {
      this.overlayEl.parentNode.removeChild(this.overlayEl);
      this.overlayEl = null;
    }
  }
}
