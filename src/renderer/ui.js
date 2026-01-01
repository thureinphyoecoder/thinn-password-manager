import { initCreateScreen } from "./events/create.js";
import { initUnlockScreen } from "./events/unlock.js";
import { initHomeScreen } from "./events/home.js";

/* =========================
   SCREEN REGISTRY
========================= */
const SCREENS = ["create", "unlock", "home"];

/* =========================
   FORCE CLOSE OVERLAYS
========================= */
function forceCloseOverlays() {
  const addItemModal = document.getElementById("add-item-modal");
  if (addItemModal) {
    addItemModal.hidden = true;
    addItemModal.classList.remove("is-open");
  }
}

/* =========================
   SHOW SCREEN (SINGLE TRUTH)
========================= */
export function showScreen(name) {
  // close overlays
  const modal = document.getElementById("add-item-modal");
  if (modal) modal.hidden = true;

  // hide all screens
  ["create-screen", "unlock-screen", "home-screen"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });

  // show target
  const target = document.getElementById(`${name}-screen`);
  if (target) target.hidden = false;

  const isHome = name === "home";

  // 🔥 SINGLE SOURCE OF TRUTH
  document.body.dataset.screen = isHome ? "home" : "auth";

  // 🔓 enable / disable controls
  const settingsBtn = document.getElementById("settings-btn");
  const addItemBtn = document.getElementById("add-item-btn");
  const lockBtn = document.getElementById("lock-btn");

  if (settingsBtn) settingsBtn.disabled = false;
  if (addItemBtn) addItemBtn.disabled = !isHome;
  if (lockBtn) lockBtn.disabled = !isHome;

  // lifecycle
  if (name === "unlock") initUnlockScreen();
  if (name === "create") initCreateScreen();
  if (name === "home") initHomeScreen();

  console.log("[UI] showScreen →", name);
}
