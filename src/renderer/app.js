import { setState, AppStates } from "./state/state.js";
import { renderHome } from "./ui/home.js";
import "./ui/modal.js";
import "./shared/eyeToggle.js";
import "./shared/confirm.js";

import { initAvatarMenu } from "./ui/home.js";

import { initCreateScreen } from "./features/auth/create.js";
import { initUnlockScreen } from "./features/auth/unlock.js";

import { initCategoryEvents } from "./features/categories/categoryEvents.js";
import { renderCategories } from "./ui/index.js";

import { bindAddItemEvents, bindItemActions } from "./features/items/itemEvents.js";

window.addEventListener("DOMContentLoaded", async () => {
  console.log("[APP] DOMContentLoaded");

  //  INIT EVENTS (ONCE ONLY)
  initCategoryEvents();
  bindAddItemEvents();

  let launch;
  try {
    launch = await window.vault.getLaunchState();
  } catch (err) {
    console.error("[APP] Failed to get launch state", err);
    return;
  }

  const { state } = launch;

  switch (state) {
    case "NO_ACCOUNT":
      setState(AppStates.NO_ACCOUNT);
      initCreateScreen();
      break;
    case "LOCKED":
      setState(AppStates.LOCKED);
      initUnlockScreen();
      break;
    case "UNLOCKED":
      setState(AppStates.UNLOCKED);
      break;
    default:
      setState(AppStates.NO_ACCOUNT);
      initCreateScreen();
  }

  window.vault.onLocked(() => {
    setState(AppStates.LOCKED);
  });

  window.vault.onUnlocked(async () => {
    setState(AppStates.UNLOCKED);

    initAvatarMenu();
    renderCategories();

    // 🔥 render vault ONLY (no binding)
    const vault = await window.vault.loadVault();
    renderHome(vault);
  });

  window.vault.onChanged(async () => {
    const vault = await window.vault.loadVault();
    renderHome(vault);
  });

  console.log("[APP] app.js ready");
});
