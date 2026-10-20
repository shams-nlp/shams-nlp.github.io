import { interpolate } from "remotion";
import { EASE, enter } from "../lib/scene";
import { SpeedOption, SPEED_PROFILES } from "../lib/speed-profiles";

export class TiersAnimationController {
  private speed: SpeedOption = "medium";
  private containerEl: HTMLElement | null = null;
  private tiersSvg: SVGSVGElement | null = null;
  private tierEls: (SVGGraphicsElement | null)[] = [];
  private arrowEls: { [key: string]: SVGGraphicsElement | null } = {};
  private hasAnimated = false;
  private observer: IntersectionObserver | null = null;
  private activeHighlight: string | null = null;

  constructor() {
    this.containerEl = document.querySelector("#tiers .figbox");
    this.tiersSvg = document.querySelector("#tiers svg.tiers-figure");

    this.tierEls = [
      document.querySelector("#tier1"),
      document.querySelector("#tier2"),
      document.querySelector("#tier3"),
      document.querySelector("#tier4"),
    ];

    this.arrowEls = {
      asr: document.querySelector("#arrow-asr"),
      diac: document.querySelector("#arrow-diac"),
      g2p: document.querySelector("#arrow-g2p"),
      a2p: document.querySelector("#arrow-a2p"),
    };
  }

  public setSpeed(speed: SpeedOption) {
    this.speed = speed;
    this.cleanup();
    this.init();
  }

  public init() {
    if (!this.containerEl || !this.tiersSvg) return;

    this.tierEls.forEach((el) => {
      if (el) {
        el.style.transformOrigin = "50% 50%";
        el.style.transition = "opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
      }
    });

    Object.values(this.arrowEls).forEach((el) => {
      if (el) {
        el.style.transition = "opacity 0.35s ease, filter 0.35s ease";
      }
    });

    // Reset before viewport trigger
    this.setFrame(0);

    const config = SPEED_PROFILES[this.speed];
    const durationMs = config.tiersDurationSec * 1000;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.hasAnimated) {
          this.hasAnimated = true;
          const startTime = performance.now();

          const loop = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(1, Math.max(0, elapsed / durationMs));
            this.setFrame(progress * 60);
            if (progress < 1) {
              requestAnimationFrame(loop);
            }
          };
          requestAnimationFrame(loop);
        }
      },
      { threshold: 0.15 }
    );

    if (this.containerEl) this.observer.observe(this.containerEl);

    // Setup interactive task arrow clicks/hovers
    this.setupInteractivity();
  }

  private setupInteractivity() {
    const taskMap: { [key: string]: { relatedTiers: number[]; arrowKey: string } } = {
      asr: { relatedTiers: [0, 1], arrowKey: "asr" },
      diac: { relatedTiers: [1, 2], arrowKey: "diac" },
      g2p: { relatedTiers: [1, 3], arrowKey: "g2p" },
      a2p: { relatedTiers: [0, 3], arrowKey: "a2p" },
    };

    Object.entries(taskMap).forEach(([taskKey, config]) => {
      const arrowEl = this.arrowEls[config.arrowKey];
      if (!arrowEl) return;

      arrowEl.style.cursor = "pointer";

      const onEnter = () => this.highlightTask(taskKey, config.relatedTiers);
      const onLeave = () => this.clearHighlight();

      arrowEl.addEventListener("mouseenter", onEnter);
      arrowEl.addEventListener("mouseleave", onLeave);
      arrowEl.addEventListener("click", () => {
        if (this.activeHighlight === taskKey) {
          this.clearHighlight();
        } else {
          this.highlightTask(taskKey, config.relatedTiers);
        }
      });
    });
  }

  private highlightTask(taskKey: string, relatedTiers: number[]) {
    this.activeHighlight = taskKey;

    Object.entries(this.arrowEls).forEach(([k, el]) => {
      if (!el) return;
      if (k === taskKey) {
        el.style.opacity = "1";
        el.style.filter = "drop-shadow(0 0 6px rgba(232, 66, 38, 0.7))";
      } else {
        el.style.opacity = "0.2";
        el.style.filter = "none";
      }
    });

    this.tierEls.forEach((el, idx) => {
      if (!el) return;
      if (relatedTiers.includes(idx)) {
        el.style.opacity = "1";
        el.style.transform = "scale(1.015)";
      } else {
        el.style.opacity = "0.35";
        el.style.transform = "scale(0.99)";
      }
    });
  }

  private clearHighlight() {
    this.activeHighlight = null;
    Object.values(this.arrowEls).forEach((el) => {
      if (el) {
        el.style.opacity = "1";
        el.style.filter = "none";
      }
    });
    this.tierEls.forEach((el) => {
      if (el) {
        el.style.opacity = "1";
        el.style.transform = "none";
      }
    });
  }

  private setFrame(frame: number) {
    if (this.activeHighlight) return;

    // Staggered tier entrance (tier 1 to 4)
    const tierStarts = [0, 8, 16, 24];
    this.tierEls.forEach((el, i) => {
      if (!el) return;
      const start = tierStarts[i];
      const p = enter(frame, start, 16, EASE);
      const rise = interpolate(p, [0, 1], [22, 0]);
      el.style.opacity = `${p}`;
      el.style.transform = `translate3d(0, ${rise}px, 0)`;
    });

    // Connecting arrows
    const arrowKeys = ["asr", "diac", "g2p", "a2p"];
    const arrowStarts = [30, 36, 42, 48];
    arrowKeys.forEach((key, i) => {
      const el = this.arrowEls[key];
      if (!el) return;
      const start = arrowStarts[i];
      const p = enter(frame, start, 16, EASE);
      el.style.opacity = `${p}`;
      el.style.transform = `scale(${interpolate(p, [0, 1], [0.92, 1])})`;
    });
  }

  private cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.clearHighlight();
    this.hasAnimated = false;
  }
}
