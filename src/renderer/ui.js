const screens = {
  create: document.getElementById("create-screen"),
  unlock: document.getElementById("unlock-screen"),
  home: document.getElementById("home-screen"),
};

export function showScreen(name) {
  Object.values(screens).forEach((s) => (s.hidden = true));
  screens[name].hidden = false;
}
