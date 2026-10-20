import { interpolate } from "remotion";
import { POP, enter } from "../lib/scene";

export class StatsAnimationController {
  private statsContainer: HTMLElement | null = null;
  private statsUl: HTMLElement | null = null;
  private statItems: HTMLElement[] = [];
  private observer: IntersectionObserver | null = null;
  private hasAnimated = false;

  // Sliding loop state
  private autoSlideTimer: any = null;
  private idleTimer: any = null;
  private currentIndex = 0;
  private totalOriginal = 5;
  private isUserInteracting = false;
  private dotsContainer: HTMLElement | null = null;
  private dotEls: HTMLElement[] = [];
  private scrollDebounce: any = null;

  constructor() {
    this.statsContainer = document.querySelector(".stats");
    this.statsUl = document.querySelector(".stats ul");
    if (this.statsUl) {
      // Remove any previously cloned nodes if present
      const oldClones = this.statsUl.querySelectorAll(".stat-clone");
      oldClones.forEach((c) => c.remove());

      this.statItems = Array.from(this.statsUl.querySelectorAll("li.stat"));
      this.totalOriginal = this.statItems.length || 5;
    }
  }

  public init() {
    if (!this.statsUl || this.statItems.length === 0) return;

    // Entry stagger and count-up animation
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
      { threshold: 0.15 }
    );

    this.observer.observe(this.statsUl);

    // Setup horizontal sliding loop
    this.setupLoopSlider();
  }

  private animateStats() {
    this.statItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = "1";
        item.style.transform = "scale(1) translateY(0)";

        const numSpan = item.querySelector(".n") as HTMLElement | null;
        if (numSpan) {
          this.animateNumber(numSpan);
        }
      }, index * 100);
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

  private isMobileOrHorizontal(): boolean {
    if (!this.statsUl) return false;
    // Check if stats ul is overflowing horizontally
    return this.statsUl.scrollWidth > this.statsUl.clientWidth + 10;
  }

  private setupLoopSlider() {
    if (!this.statsUl || !this.statsContainer) return;

    // Create dot indicators
    let existingDots = this.statsContainer.querySelector(".stats-loop-nav") as HTMLElement | null;
    if (!existingDots) {
      this.dotsContainer = document.createElement("div");
      this.dotsContainer.className = "stats-loop-nav";
      this.dotsContainer.setAttribute("aria-label", "SHAMS properties navigation");

      this.dotEls = [];
      for (let i = 0; i < this.totalOriginal; i++) {
        const dot = document.createElement("button");
        dot.className = `stats-loop-dot${i === 0 ? " active" : ""}`;
        dot.setAttribute("aria-label", `View property ${i + 1} of ${this.totalOriginal}`);
        dot.addEventListener("click", () => this.goToIndex(i));
        this.dotsContainer.appendChild(dot);
        this.dotEls.push(dot);
      }
      this.statsContainer.appendChild(this.dotsContainer);
    } else {
      this.dotsContainer = existingDots;
      this.dotEls = Array.from(existingDots.querySelectorAll(".stats-loop-dot"));
    }

    // Listeners for user interaction to pause/resume auto-slide
    const onUserInteract = () => {
      this.isUserInteracting = true;
      if (this.idleTimer) clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => {
        this.isUserInteracting = false;
        this.syncCurrentIndexFromScroll();
      }, 3500);
    };

    this.statsUl.addEventListener("touchstart", onUserInteract, { passive: true });
    this.statsUl.addEventListener("pointerdown", onUserInteract, { passive: true });
    this.statsUl.addEventListener("wheel", onUserInteract, { passive: true });
    this.statsUl.addEventListener("mouseenter", () => { this.isUserInteracting = true; });
    this.statsUl.addEventListener("mouseleave", () => {
      this.idleTimer = setTimeout(() => {
        this.isUserInteracting = false;
        this.syncCurrentIndexFromScroll();
      }, 1500);
    });

    this.statsUl.addEventListener(
      "scroll",
      () => {
        if (this.scrollDebounce) cancelAnimationFrame(this.scrollDebounce);
        this.scrollDebounce = requestAnimationFrame(() => {
          this.syncCurrentIndexFromScroll();
        });
      },
      { passive: true }
    );

    // Start auto-slide timer
    this.startAutoSlide();

    // Check on resize
    window.addEventListener("resize", () => {
      this.checkSliderVisibility();
    });
    this.checkSliderVisibility();
  }

  private checkSliderVisibility() {
    if (!this.statsUl || !this.dotsContainer) return;
    const isScrollable = this.isMobileOrHorizontal();
    this.dotsContainer.style.display = isScrollable ? "flex" : "none";
  }

  private startAutoSlide() {
    if (this.autoSlideTimer) clearInterval(this.autoSlideTimer);
    this.autoSlideTimer = setInterval(() => {
      this.stepNext();
    }, 3000);
  }

  private stepNext() {
    if (!this.statsUl || this.isUserInteracting || document.hidden) return;
    if (!this.isMobileOrHorizontal()) return;

    const cards = this.statItems;
    if (cards.length === 0) return;

    // Advance to next index, looping back from 4 to 0
    let nextIndex = (this.currentIndex + 1) % cards.length;
    const targetCard = cards[nextIndex];
    const left = targetCard.offsetLeft - this.statsUl.offsetLeft - 4;
    this.statsUl.scrollTo({ left, behavior: "smooth" });
    this.currentIndex = nextIndex;
    this.updateDots(nextIndex);
  }

  public goToIndex(index: number) {
    if (!this.statsUl) return;
    this.isUserInteracting = true;
    if (this.idleTimer) clearTimeout(this.idleTimer);

    const cards = this.statItems;
    if (index >= 0 && index < cards.length) {
      const targetCard = cards[index];
      const left = targetCard.offsetLeft - this.statsUl.offsetLeft - 4;
      this.statsUl.scrollTo({ left, behavior: "smooth" });
      this.currentIndex = index;
      this.updateDots(index);
    }

    this.idleTimer = setTimeout(() => {
      this.isUserInteracting = false;
    }, 3500);
  }

  private syncCurrentIndexFromScroll() {
    if (!this.statsUl) return;
    const cards = this.statItems;
    if (cards.length === 0) return;

    const currentScroll = this.statsUl.scrollLeft + this.statsUl.offsetLeft;
    let closestIdx = 0;
    let minDiff = Infinity;

    cards.forEach((child, idx) => {
      const diff = Math.abs(child.offsetLeft - currentScroll - 4);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    this.currentIndex = closestIdx;
    this.updateDots(closestIdx);
  }

  private updateDots(activeIdx: number) {
    this.dotEls.forEach((dot, idx) => {
      if (idx === activeIdx) {
        dot.classList.add("active");
        dot.setAttribute("aria-current", "true");
      } else {
        dot.classList.remove("active");
        dot.removeAttribute("aria-current");
      }
    });
  }

  public cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
      this.autoSlideTimer = null;
    }
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    this.hasAnimated = false;
  }
}
