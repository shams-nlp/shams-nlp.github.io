import { LogoEntranceManager } from "../animations/logo-entrance";
import { mountAnimatedMap } from "../animations/map-controller";
import { TiersAnimationController } from "../animations/tiers-controller";
import { StatsAnimationController } from "../animations/stats-controller";
import { SpeedOption } from "../lib/speed-profiles";

export class OptionsManager {
  private currentSpeed: SpeedOption = "fast";
  private logoManager: LogoEntranceManager;
  private tiersController: TiersAnimationController;
  private statsController: StatsAnimationController;

  constructor(
    logoManager: LogoEntranceManager,
    tiersController: TiersAnimationController,
    statsController: StatsAnimationController
  ) {
    this.logoManager = logoManager;
    this.tiersController = tiersController;
    this.statsController = statsController;
    this.currentSpeed = "fast";
  }

  public init() {
    this.applySpeed("fast", false);

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

  public applySpeed(speed: SpeedOption = "fast", triggerIntro = true) {
    this.currentSpeed = speed;
    this.logoManager.setSpeed(speed);
    mountAnimatedMap(speed);
    this.tiersController.setSpeed(speed);
    this.statsController.init();

    if (triggerIntro) {
      this.logoManager.start(speed);
    }
  }

  public replayIntro() {
    this.logoManager.start(this.currentSpeed);
  }
}
