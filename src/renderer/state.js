import { showScreen } from "./ui.js";

export const AppState = {
  current: null,
};

export function setState(state) {
  AppState.current = state;
  syncUI(state);
}

function syncUI(state) {
  switch (state) {
    case "NO_ACCOUNT":
      showScreen("create");
      break;

    case "LOCKED":
      showScreen("unlock");
      break;

    case "UNLOCKED":
      showScreen("home");
      break;

    default:
      console.warn("Unknown app state:", state);
  }

  console.log("state.js loaded");
}
