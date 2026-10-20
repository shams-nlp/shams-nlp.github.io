import { LogoEntranceManager } from "../animations/logo-entrance";
import { mountAnimatedMap } from "../animations/map-controller";
import { TiersAnimationController } from "../animations/tiers-controller";
import { StatsAnimationController } from "../animations/stats-controller";
import { SpeedOption, SPEED_PROFILES, SpeedConfig } from "../lib/speed-profiles";

export class OptionsManager {
  private currentSpeed: SpeedOption = "medium";
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

    const saved = localStorage.getItem("shams_animation_speed") as SpeedOption | null;
    if (saved && (saved === "slow" || saved === "medium" || saved === "fast")) {
      this.currentSpeed = saved;
    }
  }

  public init() {
    this.applySpeed(this.currentSpeed, false);
    this.renderSwitcher();

    // Clicking brand logo in header replays the intro
    const brandMark = document.querySelector(".brand");
    if (brandMark) {
      brandMark.addEventListener("click", () => {
        this.logoManager.start(this.currentSpeed);
      });
      (brandMark as HTMLElement).style.cursor = "pointer";
      (brandMark as HTMLElement).setAttribute("title", "Click to replay intro");
    }
  }

  public applySpeed(speed: SpeedOption, triggerIntro = true) {
    this.currentSpeed = speed;
    localStorage.setItem("shams_animation_speed", speed);

    this.logoManager.setSpeed(speed);
    mountAnimatedMap(speed);
    this.tiersController.setSpeed(speed);
    this.statsController.init();

    if (triggerIntro) {
      this.logoManager.start(speed);
    }

    this.updateSwitcherUI();
  }

  public replayIntro() {
    this.logoManager.start(this.currentSpeed);
  }

  private renderSwitcher() {
    if (document.getElementById("shams-speed-switcher")) return;

    this.switcherEl = document.createElement("div");
    this.switcherEl.id = "shams-speed-switcher";
    this.switcherEl.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9990;
      background: rgba(252, 249, 241, 0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(32, 28, 60, 0.2);
      border-radius: 18px;
      padding: 12px 16px;
      box-shadow: 0 10px 32px rgba(32, 28, 60, 0.16);
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 420px;
      font-family: var(--head, "Inter Tight", sans-serif);
      color: var(--ink, #201C3C);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    this.updateSwitcherUI();
    document.body.appendChild(this.switcherEl);
  }

  private updateSwitcherUI() {
    if (!this.switcherEl) return;

    const currentCfg: SpeedConfig = SPEED_PROFILES[this.currentSpeed];

    this.switcherEl.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--flame, #E84226);">
          Animation Speed
        </span>
        <button id="btn-replay-intro" style="
          border: none;
          background: rgba(232, 66, 38, 0.12);
          color: var(--flame, #E84226);
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: background 0.2s;
        " title="Replay centered logo and wordmark entrance">
          ↺ Replay Intro
        </button>
      </div>

      <div style="display: flex; gap: 4px; background: rgba(32, 28, 60, 0.06); padding: 4px; border-radius: 12px;">
        <button data-speed="slow" class="speed-btn" style="
          flex: 1;
          padding: 6px 10px;
          border: none;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          background: ${this.currentSpeed === "slow" ? "var(--ink, #201C3C)" : "transparent"};
          color: ${this.currentSpeed === "slow" ? "var(--ivory, #FCF9F1)" : "var(--ink, #201C3C)"};
          transition: all 0.2s;
          white-space: nowrap;
        ">
          Slow (~7.6s)
        </button>
        <button data-speed="medium" class="speed-btn" style="
          flex: 1;
          padding: 6px 10px;
          border: none;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          background: ${this.currentSpeed === "medium" ? "var(--ink, #201C3C)" : "transparent"};
          color: ${this.currentSpeed === "medium" ? "var(--ivory, #FCF9F1)" : "var(--ink, #201C3C)"};
          transition: all 0.2s;
          white-space: nowrap;
        ">
          Medium (~5.0s)
        </button>
        <button data-speed="fast" class="speed-btn" style="
          flex: 1;
          padding: 6px 10px;
          border: none;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          background: ${this.currentSpeed === "fast" ? "var(--ink, #201C3C)" : "transparent"};
          color: ${this.currentSpeed === "fast" ? "var(--ivory, #FCF9F1)" : "var(--ink, #201C3C)"};
          transition: all 0.2s;
          white-space: nowrap;
        ">
          Fast (~3.2s)
        </button>
      </div>

      <div style="font-size: 11.5px; line-height: 1.35; color: rgba(32, 28, 60, 0.78);">
        <b>${currentCfg.name}</b>: ${currentCfg.tagline}
      </div>
    `;

    const replayBtn = this.switcherEl.querySelector("#btn-replay-intro");
    if (replayBtn) {
      replayBtn.addEventListener("click", () => this.replayIntro());
    }

    const buttons = this.switcherEl.querySelectorAll<HTMLButtonElement>(".speed-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetSpeed = btn.getAttribute("data-speed") as SpeedOption;
        if (targetSpeed && targetSpeed !== this.currentSpeed) {
          this.applySpeed(targetSpeed, true);
        }
      });
    });
  }
}
