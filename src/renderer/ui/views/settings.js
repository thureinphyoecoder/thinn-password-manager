export function initSettingsTabs() {
  const tabs = document.querySelectorAll(".settings-tab");
  const panels = document.querySelectorAll(".settings-panel");

  function showPanel(name) {
    panels.forEach((p) => {
      p.hidden = p.dataset.settingsPanel !== name;
    });

    tabs.forEach((t) => {
      t.classList.toggle("active", t.dataset.settings === name);
    });
  }

  tabs.forEach((tab) => {
    tab.onclick = () => {
      showPanel(tab.dataset.settings);
    };
  });

  //  THIS IS THE MISSING LINE (ABSOLUTE ROOT CAUSE)
  showPanel("security");
}

let isAutoLockBound = false;

export function initAutoLockSettings() {
  if (isAutoLockBound) { 
    return;
  }

  const radios = document.querySelectorAll('input[name="autoLock"]');

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const value = Number(radio.value);

      console.log("[AutoLock] set to", value);

      //  value = 0 → never
      window.vault.setAutoLock(value);
    });
  });

  isAutoLockBound = true;
}
