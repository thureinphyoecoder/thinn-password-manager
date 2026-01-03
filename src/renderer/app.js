import { setState, AppStates } from "./state.js";
import { renderHome } from "./events/home.js";
import "./events/modal.js";
import "./shared/eyeToggle.js";
import { initAvatarMenu } from "./events/home.js";

import { initCategoryEvents } from "./events/categories.js";
import { renderCategories } from "./ui.js";

import { bindAddItemEvents, bindItemActions } from "./events/item.js";

window.addEventListener("DOMContentLoaded", async () => {
  console.log("[APP] DOMContentLoaded");

  // 🔒 INIT EVENTS (ONCE ONLY)
  initCategoryEvents();
  bindAddItemEvents();
  bindItemActions();

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
      break;
    case "LOCKED":
      setState(AppStates.LOCKED);
      break;
    case "UNLOCKED":
      setState(AppStates.UNLOCKED);
      break;
    default:
      setState(AppStates.NO_ACCOUNT);
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
