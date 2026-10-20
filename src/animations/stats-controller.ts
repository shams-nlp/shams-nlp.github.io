import { interpolate } from "remotion";
import { POP, enter } from "../lib/scene";

export class StatsAnimationController {
  private statsContainer: HTMLElement | null = null;
  private statsUl: HTMLElement | null = null;
  private statItems: HTMLElement[] = [];
  private observer: IntersectionObserver | null = null;
  private hasAnimated = false;

  // Sliding loop state
  private hasCloned = false;
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
      this.statItems = Array.from(this.statsUl.querySelectorAll("li.stat:not(.stat-clone)"));
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

  private setupLoopSlider() {
    if (!this.statsUl || !this.statsContainer) return;

    // Clone the items once to create a seamless infinite loop
    if (!this.hasCloned && this.statItems.length === 5) {
      this.statItems.forEach((item) => {
        const clone = item.cloneNode(true) as HTMLElement;
        clone.classList.add("stat-clone");
        clone.setAttribute("aria-hidden", "true");
        // Ensure clones are visible
        clone.style.opacity = "1";
        clone.style.transform = "none";
        this.statsUl!.appendChild(clone);
      });
      this.hasCloned = true;
    }

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
      }, 3200);
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
    const isScrollable = this.statsUl.scrollWidth > this.statsUl.clientWidth + 10;
    this.dotsContainer.style.display = isScrollable ? "flex" : "none";
  }

  private startAutoSlide() {
    if (this.autoSlideTimer) clearInterval(this.autoSlideTimer);
    this.autoSlideTimer = setInterval(() => {
      this.stepNext();
    }, 2800);
  }

  private stepNext() {
    if (!this.statsUl || this.isUserInteracting || document.hidden) return;
    const isScrollable = this.statsUl.scrollWidth > this.statsUl.clientWidth + 10;
    if (!isScrollable) return;

    const allChildren = Array.from(this.statsUl.children) as HTMLElement[];
    if (allChildren.length === 0) return;

    const nextIndex = this.currentIndex + 1;
    if (nextIndex < allChildren.length) {
      const targetCard = allChildren[nextIndex];
      const left = targetCard.offsetLeft - this.statsUl.offsetLeft - 4;
      this.statsUl.scrollTo({ left, behavior: "smooth" });
      this.currentIndex = nextIndex;
      this.updateDots(nextIndex % this.totalOriginal);

      // If we just slid to the clone of the first item, silently loop back to item 0 after animation
      if (nextIndex >= this.totalOriginal) {
        setTimeout(() => {
          if (!this.isUserInteracting && this.statsUl) {
            const firstCard = allChildren[0];
            const resetLeft = firstCard.offsetLeft - this.statsUl.offsetLeft - 4;
            this.statsUl.scrollTo({ left: resetLeft, behavior: "instant" });
            this.currentIndex = 0;
            this.updateDots(0);
          }
        }, 500);
      }
    } else {
      this.currentIndex = 0;
      this.updateDots(0);
    }
  }

  public goToIndex(index: number) {
    if (!this.statsUl) return;
    this.isUserInteracting = true;
    if (this.idleTimer) clearTimeout(this.idleTimer);

    const allChildren = Array.from(this.statsUl.children) as HTMLElement[];
    if (index >= 0 && index < allChildren.length) {
      const targetCard = allChildren[index];
      const left = targetCard.offsetLeft - this.statsUl.offsetLeft - 4;
      this.statsUl.scrollTo({ left, behavior: "smooth" });
      this.currentIndex = index;
      this.updateDots(index % this.totalOriginal);
    }

    this.idleTimer = setTimeout(() => {
      this.isUserInteracting = false;
    }, 3500);
  }

  private syncCurrentIndexFromScroll() {
    if (!this.statsUl) return;
    const allChildren = Array.from(this.statsUl.children) as HTMLElement[];
    if (allChildren.length === 0) return;

    const currentScroll = this.statsUl.scrollLeft + this.statsUl.offsetLeft;
    let closestIdx = 0;
    let minDiff = Infinity;

    allChildren.forEach((child, idx) => {
      const diff = Math.abs(child.offsetLeft - currentScroll - 4);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    this.currentIndex = closestIdx;
    this.updateDots(closestIdx % this.totalOriginal);
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
