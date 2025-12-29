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
    showScreen("create");
  } else if (state === "LOCKED") {
    showScreen("unlock");
    requestAnimationFrame(() => {
      document.getElementById("unlock-pw")?.focus();
    });
  } else if (state === "UNLOCKED") {
    showScreen("home");
  }

  bindEvents();
  console.log("app.js ready");
});
