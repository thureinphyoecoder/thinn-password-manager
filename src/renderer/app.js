import { setState, AppStates } from "./state.js";
import { renderHome } from "./events/home.js";
import "./events/modal.js";
import "./shared/eyeToggle.js";

window.addEventListener("DOMContentLoaded", async () => {
  console.log("[APP] DOMContentLoaded");

  let launch;
  try {
    launch = await window.vault.getLaunchState();
  } catch (err) {
    console.error("[APP] Failed to get launch state", err);
    return;
  }

  const { state } = launch;
  console.log("[APP] Launch state:", state);

  /**
   * 🔥 IMPORTANT
   * Normalize external launch state
   * NEVER pass raw string directly to setState
   */
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
      console.warn(
        "[APP] Unknown launch state, fallback to NO_ACCOUNT:",
        state
      );
      setState(AppStates.NO_ACCOUNT);
  }

  // =========================
  // Vault runtime events
  // =========================

  window.vault.onLocked(() => {
    console.log("[APP] Vault locked");
    setState(AppStates.LOCKED);
  });

  window.vault.onUnlocked(() => {
    console.log("[APP] Vault unlocked");
    setState(AppStates.UNLOCKED);
  });

  window.vault.onChanged(async () => {
    console.log("[APP] Vault changed → reload vault data");
    const vault = await window.vault.loadVault();
    renderHome(vault);
  });

  console.log("[APP] app.js ready");
});
