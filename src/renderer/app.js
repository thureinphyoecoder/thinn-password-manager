import { showScreen } from "./ui.js";
import { bindEvents } from "./events.js";
import "./events/modal.js";
import "./shared/eyeToggle.js";

window.addEventListener("DOMContentLoaded", async () => {
  console.log("DOMContentLoaded");

  let launch;
  try {
    launch = await window.vault.getLaunchState();
  } catch (err) {
    console.error("Failed to get launch state", err);
    return;
  }

  const { state } = launch;
  console.log("Launch state:", state);

  if (state === "NO_ACCOUNT") {
    document.body.dataset.vault = "locked";
    showScreen("create");
  } else if (state === "LOCKED") {
    document.body.dataset.vault = "locked";
    showScreen("unlock");
    requestAnimationFrame(() => {
      document.getElementById("unlock-pw")?.focus();
    });
  } else if (state === "UNLOCKED") {
    document.body.dataset.vault = "unlocked";

    showScreen("home");
  }

  // =========================
  // Vault runtime events
  // =========================
  window.vault.onLocked(() => {
    console.log("Vault locked → switch to unlock screen");

    document.body.dataset.vault = "locked";
    showScreen("unlock");

    requestAnimationFrame(() => {
      document.getElementById("unlock-pw")?.focus();
    });
  });

  window.vault.onUnlocked(() => {
    console.log("Vault unlocked → switch to home");

    document.body.dataset.vault = "unlocked";
    showScreen("home");
  });

  bindEvents();
  console.log("app.js ready");
});
