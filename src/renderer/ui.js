const screens = {
  create: document.getElementById("create-screen"),
  unlock: document.getElementById("unlock-screen"),
  home: document.getElementById("home-screen"),
};

export function showScreen(name) {
  const header = document.querySelector(".app-header");

  const screens = {
    create: document.getElementById("create-screen"),
    unlock: document.getElementById("unlock-screen"),
    home: document.getElementById("home-screen"),
  };

  // hide all
  Object.values(screens).forEach((s) => {
    if (s) s.hidden = true;
  });

  // show target
  if (screens[name]) {
    screens[name].hidden = false;
  }

  if (name === "create" || name === "unlock") {
    document.body.dataset.screen = "auth";
    if (header) header.hidden = true;
  }

  if (name === "home") {
    document.body.dataset.screen = "home";
    if (header) header.hidden = false;
  }
}
