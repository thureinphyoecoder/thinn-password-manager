import { showScreen } from "./ui.js";

/**
 * App Meta
 */
export const APP_NAME = "Thinn Password Manager";

/**
 * Canonical App States (State Machine)
 * -------------------------------
 * BOOT        : App just started, deciding next state
 * NO_ACCOUNT  : No vault exists (register / create)
 * LOCKED      : Vault exists but locked
 * UNLOCKED    : Vault unlocked (home)
 */
export const AppStates = Object.freeze({
  BOOT: "BOOT",
  NO_ACCOUNT: "NO_ACCOUNT",
  LOCKED: "LOCKED",
  UNLOCKED: "UNLOCKED",
});

/**
 * Single Source of Truth
 */
export const AppState = {
  current: AppStates.BOOT,
};

/**
 * Public API — state transition
 */
export function setState(nextState) {
  if (!Object.values(AppStates).includes(nextState)) {
    console.warn("[STATE] Invalid state:", nextState);
    return;
  }

  if (AppState.current === nextState) {
    return; // no-op
  }

  AppState.current = nextState;
  syncUI(nextState);

  console.log("[STATE] →", nextState);
}

/**
 * Read-only getter (optional but safe)
 */
export function getState() {
  return AppState.current;
}

/**
 * UI Synchronization
 * -----------------
 * IMPORTANT RULE:
 * - NO vault logic
 * - NO storage access
 * - NO condition guessing
 * - ONLY map state → screen
 */
function syncUI(state) {
  switch (state) {
    case AppStates.NO_ACCOUNT:
      document.body.dataset.screen = "auth";
      showScreen("create");
      break;

    case AppStates.LOCKED:
      document.body.dataset.screen = "auth";
      showScreen("unlock");
      requestAnimationFrame(() => {
        document.getElementById("unlock-pw")?.focus();
      });
      break;

    case AppStates.UNLOCKED:
      document.body.dataset.screen = "home";
      showScreen("home");
      break;
  }
}

// =========================
// HOME VIEW STATE
// =========================
export const HomeViews = {
  VAULT: "vault",
  SETTINGS: "settings",
};

export const HomeState = {
  view: HomeViews.VAULT,
};

export function setHomeView(view) {
  HomeState.view = view;
  syncHomeView();
}

function syncHomeView() {
  const vaultView = document.getElementById("vault-view");
  const settingsView = document.getElementById("settings-screen");

  if (!vaultView || !settingsView) return;

  vaultView.hidden = HomeState.view !== HomeViews.VAULT;
  settingsView.hidden = HomeState.view !== HomeViews.SETTINGS;
}
