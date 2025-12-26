console.log("renderer app.js loaded", window.vault);

import { showScreen } from "./ui.js";
import { bindEvents } from "./events.js";

window.addEventListener("DOMContentLoaded", async () => {
  const { state } = await window.vault.getLaunchState();

  if (state === "NO_ACCOUNT") showScreen("create");

  if (state === "LOCKED") {
    showScreen("unlock");

    requestAnimationFrame(() => {
      document.getElementById("unlock-pw")?.focus();
    });
  }

  bindEvents();
});
