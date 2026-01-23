import { setState, AppStates } from "./state/state.js";
import { renderHome } from "./ui/views/home.js";
import "./ui/add-item-modal.js";
import "./shared/utils/eyeToggle.js";
import "./shared/utils/confirm.js";
import "./ui/modal.js";

import { initAvatarMenu } from "./ui/views/home.js";

import { initCreateScreen } from "./features/auth/create.js";
import { initUnlockScreen } from "./features/auth/unlock.js";

import { initCategoryEvents } from "./features/categories/categoryEvents.js";
import { renderCategories } from "./ui/index.js";

import { bindAddItemEvents } from "./features/items/itemEvents.js";

import { exportVaultUI } from "./features/export/export.js";
import { importVaultUI } from "./features/import/import.js";

window.addEventListener("DOMContentLoaded", async () => {
  const exportBtn = document.getElementById("export-vault-btn");
  const importBtn = document.getElementById("import-vault-btn");

  exportBtn?.addEventListener("click", () => {
    exportVaultUI();
  });

  importBtn?.addEventListener("click", () => {
    importVaultUI();
  });

  //  INIT EVENTS (ONCE ONLY)
  initCategoryEvents();
  bindAddItemEvents();
  initAvatarMenu();

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
