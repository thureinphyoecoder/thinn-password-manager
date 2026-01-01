export function initSettingsTabs() {
  const navItems = document.querySelectorAll(".settings-nav-item");
  const panels = document.querySelectorAll("[data-settings-panel]");

  function activate(name) {
    navItems.forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.settings === name)
    );

    panels.forEach((panel) =>
      panel.toggleAttribute("hidden", panel.dataset.settingsPanel !== name)
    );
  }

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      activate(btn.dataset.settings);
    });
  });

  activate("security");
}

function initAutoLockSettings() {
  const radios = document.querySelectorAll('input[name="autoLock"]');

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const value = Number(radio.value);

      console.log("[AutoLock] set to", value);

      // 🔥 value = 0 → never
      window.vault.setAutoLock(value);
    });
  });
}
