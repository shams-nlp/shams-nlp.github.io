import { LogoEntranceManager } from "../animations/logo-entrance";
import { mountAnimatedMap, MapMode } from "../animations/map-controller";
import { TiersAnimationController, TiersMode } from "../animations/tiers-controller";
import { StatsAnimationController } from "../animations/stats-controller";

export type AnimationOption = "scrollytelling" | "autonomous" | "interactive";

const OPTIONS_METADATA = {
  scrollytelling: {
    id: "scrollytelling",
    label: "Option 1: Scrollytelling",
    tagline: "Scroll controls timeline: scrub logo flight, map dialect reveal & tier construction",
  },
  autonomous: {
    id: "autonomous",
    label: "Option 2: Autonomous Reveal",
    tagline: "Fluid auto-entrance: logo glides to slot, elements reveal smoothly on scroll",
  },
  interactive: {
    id: "interactive",
    label: "Option 3: Interactive Stage",
    tagline: "Explorer console: dialect filter chips, walkthrough tour & task highlight modes",
  },
} as const;

export class OptionsManager {
  private currentOption: AnimationOption = "autonomous";
  private logoManager: LogoEntranceManager;
  private tiersController: TiersAnimationController;
  private statsController: StatsAnimationController;
  private switcherEl: HTMLElement | null = null;

  constructor(
    logoManager: LogoEntranceManager,
    tiersController: TiersAnimationController,
    statsController: StatsAnimationController
  ) {
    this.logoManager = logoManager;
    this.tiersController = tiersController;
    this.statsController = statsController;

    // Load saved option or default to autonomous
    const saved = localStorage.getItem("shams_animation_option") as AnimationOption | null;
    if (saved && (saved === "scrollytelling" || saved === "autonomous" || saved === "interactive")) {
      this.currentOption = saved;
    }
  }

  public init() {
    this.applyOption(this.currentOption, false);
    this.renderSwitcher();

    // Hook click on brand mark to replay logo intro
    const brandMark = document.querySelector(".brand svg");
    if (brandMark) {
      brandMark.addEventListener("click", () => {
        this.logoManager.start(this.currentOption);
      });
      (brandMark as HTMLElement).style.cursor = "pointer";
      (brandMark as HTMLElement).setAttribute("title", "Click to replay logo intro");
    }
  }

  public applyOption(option: AnimationOption, triggerIntro = true) {
    this.currentOption = option;
    localStorage.setItem("shams_animation_option", option);

    // Update managers
    this.logoManager.setMode(option);
    mountAnimatedMap(option as MapMode);
    this.tiersController.setMode(option as TiersMode);
    this.statsController.init();

    if (triggerIntro) {
      this.logoManager.start(option);
    }

    this.updateSwitcherUI();
  }

  public replayIntro() {
    this.logoManager.start(this.currentOption);
  }

  private renderSwitcher() {
    if (document.getElementById("shams-option-switcher")) return;

    this.switcherEl = document.createElement("div");
    this.switcherEl.id = "shams-option-switcher";
    this.switcherEl.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9990;
      background: rgba(252, 249, 241, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(32, 28, 60, 0.18);
      border-radius: 20px;
      padding: 10px 14px;
      box-shadow: 0 8px 32px rgba(32, 28, 60, 0.14);
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-width: 440px;
      font-family: var(--head, "Inter Tight", sans-serif);
      color: var(--ink, #201C3C);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    this.updateSwitcherUI();
    document.body.appendChild(this.switcherEl);
  }

  private updateSwitcherUI() {
    if (!this.switcherEl) return;

    const opt = OPTIONS_METADATA[this.currentOption];

    this.switcherEl.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 2px;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--flame, #E84226);">
          Remotion Animation Engine
        </span>
        <button id="btn-replay-intro" style="
          border: none;
          background: rgba(232, 66, 38, 0.12);
          color: var(--flame, #E84226);
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: background 0.2s;
        " title="Replay the big centered entrance animation">
          ↺ Replay Intro
        </button>
      </div>

      <div style="display: flex; gap: 4px; background: rgba(32, 28, 60, 0.06); padding: 3px; border-radius: 12px;">
        <button data-opt="scrollytelling" class="opt-btn" style="
          flex: 1;
          padding: 6px 8px;
          border: none;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          background: ${this.currentOption === "scrollytelling" ? "var(--ink, #201C3C)" : "transparent"};
          color: ${this.currentOption === "scrollytelling" ? "var(--ivory, #FCF9F1)" : "var(--ink, #201C3C)"};
          transition: all 0.2s;
          white-space: nowrap;
        ">
          1. Scrollytelling
        </button>
        <button data-opt="autonomous" class="opt-btn" style="
          flex: 1;
          padding: 6px 8px;
          border: none;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          background: ${this.currentOption === "autonomous" ? "var(--ink, #201C3C)" : "transparent"};
          color: ${this.currentOption === "autonomous" ? "var(--ivory, #FCF9F1)" : "var(--ink, #201C3C)"};
          transition: all 0.2s;
          white-space: nowrap;
        ">
          2. Autonomous
        </button>
        <button data-opt="interactive" class="opt-btn" style="
          flex: 1;
          padding: 6px 8px;
          border: none;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          background: ${this.currentOption === "interactive" ? "var(--ink, #201C3C)" : "transparent"};
          color: ${this.currentOption === "interactive" ? "var(--ivory, #FCF9F1)" : "var(--ink, #201C3C)"};
          transition: all 0.2s;
          white-space: nowrap;
        ">
          3. Interactive
        </button>
      </div>

      <div style="font-size: 11px; line-height: 1.35; color: rgba(32, 28, 60, 0.75); margin-top: 2px;">
        ${opt.tagline}
      </div>
    `;

    // Attach event listeners
    const replayBtn = this.switcherEl.querySelector("#btn-replay-intro");
    if (replayBtn) {
      replayBtn.addEventListener("click", () => this.replayIntro());
    }

    const optButtons = this.switcherEl.querySelectorAll<HTMLButtonElement>(".opt-btn");
    optButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetOpt = btn.getAttribute("data-opt") as AnimationOption;
        if (targetOpt && targetOpt !== this.currentOption) {
          this.applyOption(targetOpt, true);
        }
      });
    });
  }
}
