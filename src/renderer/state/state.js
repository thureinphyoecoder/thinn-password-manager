import { initUnlockScreen } from "../features/auth/unlock.js";
import { showScreen, closeAllOverlays, setHeaderEnabled } from "../ui/index.js";
import { initCreateScreen } from "../features/auth/create.js";
import { renderHome, initHomeScreen } from "../ui/views/home.js";

const Screens = Object.freeze({
  CREATE: "create",
  UNLOCK: "unlock",
  HOME: "home",
});

/**
 * App Meta
 */
export const APP_NAME = "Thinn Password Manager";

/**
 * Canonical App States (GLOBAL)
 * -----------------------------
 * BOOT        : App just started
 * NO_ACCOUNT  : No vault exists → Create
 * LOCKED      : Vault exists but locked → Unlock
 * UNLOCKED    : Vault unlocked → Home
 */
export const AppStates = Object.freeze({
  BOOT: "BOOT",
  NO_ACCOUNT: "NO_ACCOUNT",
  LOCKED: "LOCKED",
  UNLOCKED: "UNLOCKED",
});

/**
 * Single Source of Truth (GLOBAL)
 */
export const AppState = {
  current: AppStates.BOOT,
};

/**
 * Public API — change app state
 */
export function setState(nextState) {
  console.trace("[STATE CALL]", AppState.current, "→", nextState);

  if (!Object.values(AppStates).includes(nextState)) {
    console.warn("[STATE] Invalid state:", nextState);
    return;
  }

  if (AppState.current === nextState) return;

  AppState.current = nextState;
  syncUI(nextState);
}

/**
 * Read-only getter
 */
export function getState() {
  return AppState.current;
}

/**
 * UI Synchronization (GLOBAL)
 * --------------------------
 * RULES:
 * - NO vault logic
 * - NO storage access
 * - NO guessing
 * - ONLY map AppState → screen + basic UI
 */

async function syncUI(state) {
  closeAllOverlays();

  switch (state) {
    case AppStates.LOCKED: {
      resetHomeUI();

      document.body.dataset.screen = "auth";
      showScreen(Screens.UNLOCK);
      setHeaderEnabled(false);

      initUnlockScreen();
      break;
    }

    case AppStates.NO_ACCOUNT: {
      resetHomeUI();

      document.body.dataset.screen = "auth"; // 🔥 ADD THIS
      showScreen(Screens.CREATE);
      setHeaderEnabled(false);
      initCreateScreen();
      break;
    }

    case AppStates.UNLOCKED: {
      document.body.dataset.screen = "home";
      showScreen(Screens.HOME);
      setHeaderEnabled(true);

      //  1. render FIRST
      const vault = await window.vault.loadVault();
      renderHome(vault);

      //  2. THEN bind
      initHomeScreen(); // lock button, item actions

      break;
    }

    default:
      break;
  }
}

/* =========================================================
   HOME SUB-VIEW STATE (LOCAL TO HOME)
========================================================= */
function resetHomeUI() {
  setHomeView(HomeViews.NONE);
  document.body.dataset.view = "";
}

/**
 * Home Views (SUB STATE)
 */
export const HomeViews = Object.freeze({
  NONE: "none",
  VAULT: "vault",
  SETTINGS: "settings",
});

/**
 * Home State
 */
export const HomeState = {
  view: HomeViews.NONE,
};

/**
 * Public API — switch home view
 */
export function setHomeView(view) {
  if (!Object.values(HomeViews).includes(view)) {
    console.warn("[HOME] Invalid view:", view);
    return;
  }

  if (HomeState.view === view) {
    return; // no-op
  }

  HomeState.view = view;
  syncHomeView();
}

/**
 * Sync Home Sub-Views
 * ------------------
 * RULES:
 * - ONLY hide/show home internals
 * - NEVER touch dataset.screen
 */
function syncHomeView() {
  const vaultView = document.getElementById("vault-view");
  const settingsView = document.getElementById("settings-screen");

  if (!vaultView || !settingsView) return;

  vaultView.hidden = HomeState.view !== HomeViews.VAULT;
  settingsView.hidden = HomeState.view !== HomeViews.SETTINGS;
}
