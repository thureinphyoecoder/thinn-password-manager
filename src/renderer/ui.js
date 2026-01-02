import { CategoryState } from "./shared/categoryState.js";
/* =========================
   SCREEN IDS (CANONICAL)
========================= */
const SCREEN = ["create-screen", "unlock-screen", "home-screen"];

/* =========================
   HIDE ALL SCREENS
========================= */
function hideAllScreens() {
  SCREEN.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });
}

/* =========================
   SHOW SCREEN (DOM ONLY)
========================= */
export function showScreen(name) {
  // hide all screens
  SCREEN.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });

  const target = document.getElementById(`${name}-screen`);
  if (target) target.hidden = false;

  console.log("[UI] showScreen →", name);
}

/* =========================
   FORCE CLOSE OVERLAYS
========================= */
export function closeAllOverlays() {
  const modal = document.getElementById("add-item-modal");
  if (modal) {
    modal.hidden = true;
    modal.classList.remove("is-open");
  }
}

/* =========================
   HEADER / ACTION CONTROLS
========================= */
export function setHeaderEnabled(enabled) {
  const settingsBtn = document.getElementById("settings-btn");
  const addItemBtn = document.getElementById("add-item-btn");
  const lockBtn = document.getElementById("lock-btn");

  if (settingsBtn) settingsBtn.disabled = !enabled;
  if (addItemBtn) addItemBtn.disabled = !enabled;
  if (lockBtn) lockBtn.disabled = !enabled;
}

/* =========================
   FOCUS HELPERS
========================= */
export function focusById(id) {
  requestAnimationFrame(() => {
    document.getElementById(id)?.focus();
  });
}

export function renderCategories() {
  const list = document.querySelector(".category-list");
  list.innerHTML = "";

  CategoryState.categories.forEach((cat) => {
    const row = document.createElement("div");
    row.className = "category-item";
    row.dataset.categoryId = cat.id;

    if (cat.id === CategoryState.activeCategoryId) {
      row.classList.add("active");
    }

    row.innerHTML = `
  <!-- label (default view) -->
  <span class="category-label">${cat.name}</span>

  <!-- inline rename input (hidden by default) -->
  <input
    class="category-rename-input"
    type="text"
    value="${cat.name}"
    hidden
  />

  ${
    cat.system
      ? ""
      : `
        <div class="category-actions">
          <button
            class="icon-btn subtle category-more-btn"
            aria-label="Category actions"
          >
            <svg viewBox="0 0 24 24" width="14" height="14">
              <circle cx="5" cy="12" r="1.6" fill="currentColor" />
              <circle cx="12" cy="12" r="1.6" fill="currentColor" />
              <circle cx="19" cy="12" r="1.6" fill="currentColor" />
            </svg>
          </button>
        </div>
      `
  }
`;

    list.appendChild(row);
  });
}
