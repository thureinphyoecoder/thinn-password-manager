// src/renderer/ui.js
import { initCreateScreen } from "./events/create.js";
import { initUnlockScreen } from "./events/unlock.js";
import { initHomeScreen } from "./events/home.js";

const SCREEN_MAP = {
  create: "create-screen",
  unlock: "unlock-screen",
  home: "home-screen",
};

export function showScreen(name) {
  // 1️⃣ hide all known screens
  Object.values(SCREEN_MAP).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });

  // 2️⃣ show target
  const targetId = SCREEN_MAP[name];
  const targetEl = document.getElementById(targetId);

  if (!targetEl) {
    console.warn("[UI] Screen not found:", name);
    return;
  }

  targetEl.hidden = false;

  // 3️⃣ layout flags
  const header = document.querySelector(".app-header");
  document.body.dataset.screen = name === "home" ? "home" : "auth";

  if (header) {
    header.hidden = name !== "home";
  }

  // 4️⃣ INIT lifecycle
  switch (name) {
    case "create":
      initCreateScreen();
      break;

    case "unlock":
      initUnlockScreen();
      break;

    case "home":
      initHomeScreen?.();
      break;
  }

  console.log("[UI] showScreen →", name);
}
