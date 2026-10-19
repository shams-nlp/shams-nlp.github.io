import { interpolate } from "remotion";
import { POP, enter } from "../lib/scene";

export class StatsAnimationController {
  private statsEl: HTMLElement | null = null;
  private statItems: HTMLElement[] = [];
  private observer: IntersectionObserver | null = null;
  private hasAnimated = false;

  constructor() {
    this.statsEl = document.querySelector(".stats ul");
    if (this.statsEl) {
      this.statItems = Array.from(this.statsEl.querySelectorAll("li.stat"));
    }
  }

  public init() {
    if (!this.statsEl || this.statItems.length === 0) return;

    this.statItems.forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = "scale(0.85) translateY(12px)";
      item.style.transition = "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease";
    });

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.hasAnimated) {
          this.hasAnimated = true;
          this.animateStats();
        }
      },
      { threshold: 0.2 }
    );

    this.observer.observe(this.statsEl);
  }

  private animateStats() {
    this.statItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = "1";
        item.style.transform = "scale(1) translateY(0)";

        // Number count-up animation
        const numSpan = item.querySelector(".n") as HTMLElement | null;
        if (numSpan) {
          this.animateNumber(numSpan);
        }
      }, index * 120);
    });
  }

  private animateNumber(el: HTMLElement) {
    const originalText = el.textContent || "";

    if (originalText.includes("1,300")) {
      this.countUp(el, 0, 1300, 700, (n) => `${Math.round(n).toLocaleString()}`);
    } else if (originalText.includes("15,506")) {
      this.countUp(el, 0, 15506, 900, (n) => `${Math.round(n).toLocaleString()}`);
    } else if (originalText.includes("93.2%")) {
      this.countUp(el, 0, 93.2, 800, (n) => `${n.toFixed(1)}%`);
    }
  }

  private countUp(el: HTMLElement, from: number, to: number, durationMs: number, format: (val: number) => string) {
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const val = from + (to - from) * progress;
      el.textContent = format(val);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }

  public cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.hasAnimated = false;
  }
}
