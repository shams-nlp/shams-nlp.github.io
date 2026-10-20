import { LogoEntranceManager } from "./animations/logo-entrance";
import { TiersAnimationController } from "./animations/tiers-controller";
import { StatsAnimationController } from "./animations/stats-controller";
import { OptionsManager } from "./controller/options-manager";

function initApp() {
  const logoManager = new LogoEntranceManager();
  const tiersController = new TiersAnimationController();
  const statsController = new StatsAnimationController();

  const optionsManager = new OptionsManager(logoManager, tiersController, statsController);
  optionsManager.init();

  // Start initial logo entrance
  logoManager.start();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
