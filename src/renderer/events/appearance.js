const THEME_KEY = "thinn:theme";

export function initAppearance() {
  const group = document.querySelector(".theme-switch-group");
  if (!group) return;

  const options = group.querySelectorAll(".theme-option");
  const indicator = group.querySelector(".theme-indicator");

  const map = { system: 0, light: 1, dark: 2 };

  function apply(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem("theme", theme);

    options.forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.theme === theme)
    );

    indicator.style.transform = `translateX(${map[theme] * 100}%)`;
  }

  options.forEach((btn) => {
    btn.addEventListener("click", () => {
      apply(btn.dataset.theme);
    });
  });

  apply(localStorage.getItem("theme") || "system");
}
