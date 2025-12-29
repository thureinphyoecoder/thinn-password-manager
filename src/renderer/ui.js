const screens = {
  create: document.getElementById("create-screen"),
  unlock: document.getElementById("unlock-screen"),
  home: document.getElementById("home-screen"),
};

export function showScreen(name) {
  // hide all
  Object.values(screens).forEach((s) => (s.hidden = true));

  // show target
  screens[name].hidden = false;

  // mode control (ONLY HERE)
  if (name === "create" || name === "unlock") {
    document.body.dataset.screen = "auth";
  } else if (name === "home") {
    document.body.dataset.screen = "home";
  }
}
