import { setHomeView, HomeViews, setState, AppStates } from "../../state/state.js";
import { initSettingsTabs } from "../views/settings.js";
import { initCategoryEvents } from "../../features/categories/categoryEvents.js";
import { initAccountSettings } from "../../features/account/account.js";
import { copyIcon, eyeIcon, editIcon, trashIcon } from "../../shared/components/icon.js";
import { bindItemActions } from "../../features/items/itemEvents.js";
import { CategoryState } from "../../features/categories/categoryState.js";

const emptyState = document.getElementById("vault-empty");
const list = document.getElementById("vault-list");
const autoLockRadios = document.querySelectorAll("input[name='autoLock']");
const AUTOLOCK_KEY = "thinn:autoLock";
const searchInput = document.querySelector(".header-search");
let lastVault = null;

function setSettingsVisible(visible) {
  const settingsScreen = document.getElementById("settings-screen");
  const vaultView = document.getElementById("vault-view");
  const settingsBtn = document.getElementById("settings-btn");

  if (settingsScreen) settingsScreen.hidden = !visible;
  if (vaultView) vaultView.hidden = visible;
  settingsBtn?.classList.toggle("active", visible);
}

function bindAutoLockSettings() {
  const saved = Number(localStorage.getItem(AUTOLOCK_KEY) ?? 60000);

  autoLockRadios.forEach((r) => {
    if (Number(r.value) === saved) r.checked = true;

    r.onchange = () => {
      const ms = Number(r.value);
      localStorage.setItem(AUTOLOCK_KEY, ms);
      window.vault.setAutoLock(ms);
    };
  });

  window.vault.setAutoLock(saved);
}

function handleOpenSettings() {
  setHomeView(HomeViews.SETTINGS);
  setSettingsVisible(true);

  requestAnimationFrame(() => {
    // Tabs and account handlers require settings DOM to be visible first.
    initSettingsTabs();
    initAccountSettings();
    bindAutoLockSettings();
  });
}

function handleBackToVault() {
  setHomeView(HomeViews.VAULT);
  setSettingsVisible(false);
}

searchInput?.addEventListener("input", () => {
  if (!lastVault) return;
  renderFilteredItems(lastVault.items);
});

export function renderHome(vault) {
  lastVault = vault;

  /* =========================
     USER META (USERNAME)
  ========================= */
  const username = vault?.meta?.username || "";

  const avatar = document.querySelector(".avatar-circle");
  if (avatar) {
    avatar.textContent = username ? username.slice(0, 2).toUpperCase() : "👤";
  }

  const settingsUsernameInput = document.querySelector('.account-row input[type="text"]');
  if (settingsUsernameInput) {
    settingsUsernameInput.value = username;
  }

  const items = Array.isArray(vault?.items) ? vault.items : [];

  if (items.length === 0) {
    emptyState.hidden = false;
    list.hidden = true;
    list.innerHTML = "";
    return;
  }

  emptyState.hidden = true;
  list.hidden = false;

  renderFilteredItems(items);
}

function renderFilteredItems(items) {
  const q = searchInput?.value.trim().toLowerCase() || "";
  const activeCategoryId = CategoryState.activeCategoryId;
  let filtered = items;

  // Category filter runs before search so "No results" reflects both conditions.
  if (activeCategoryId !== "all") {
    filtered = filtered.filter((item) => item.categoryId === activeCategoryId);
  }

  if (q) {
    filtered = filtered.filter((item) =>
      [item.site, item.username, item.url].filter(Boolean).some((v) => v.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    list.innerHTML = `<div class="vault-empty-search">No results</div>`;
    return;
  }

  const sorted = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);
  list.innerHTML = sorted.map(renderItemCard).join("");
}

function renderItemCard(item) {
  const site = escapeHtml(item.site || "");
  const url = escapeHtml(item.url || "");
  const username = escapeHtml(item.username || "");
  const avatar = site ? site[0].toUpperCase() : "?";
  const showUpdated =
    Number.isFinite(item.updatedAt) &&
    Number.isFinite(item.createdAt) &&
    item.updatedAt > item.createdAt;

  return `
  <div class="vault-card" data-id="${item.id}">

    <!-- =========================
         HEADER
    ========================== -->
    <div class="vault-card__header">
      <div class="vault-header-left">
        <div class="vault-avatar">${avatar}</div>
        <div class="vault-site">${site}</div>
      </div>

      <div class="vault-header-actions">
        <button class="icon-btn sm" data-action="edit">
          ${editIcon()}
        </button>
        <button class="icon-btn sm danger" data-action="delete">
          ${trashIcon()}
        </button>
      </div>
    </div>

    <!-- =========================
         BODY (ROWS)
    ========================== -->
    <div class="vault-card__body">

      ${
        username
          ? `
      <div class="vault-row username">
        <div class="row-label">Username</div>
        <div class="row-value">${username}</div>
        <div class="row-actions">
          <button class="icon-btn sm copy-btn"
                  data-copy="username">
            ${copyIcon()}
          </button>
        </div>
      </div>
      `
          : ""
      }

      ${
        url
          ? `
      <div class="vault-row url">
        <div class="row-label">URL</div>
        <div class="row-value">${url}</div>
        <div class="row-actions">
          <button class="icon-btn sm copy-btn"
                  data-copy="url">
            ${copyIcon()}
          </button>
        </div>
      </div>
      `
          : ""
      }

      <!-- PASSWORD ROW -->
      <div class="vault-row password"
           data-password="${escapeHtml(item.password)}">
        <div class="row-label">Password</div>
        <div class="row-value password-value">••••••••••</div>
        <div class="row-actions">
          <div class="eye-slot">
            <button class="icon-btn sm eye-btn"
                  data-action="toggle-password">
            ${eyeIcon()}
          </button>
          </div>
          <button class="icon-btn sm copy-btn"
                  data-copy="password">
            ${copyIcon()}
          </button>
        </div>
      </div>

    </div>

    <!-- =========================
         FOOTER
    ========================== -->
    <div class="vault-card__footer">
      <span>Created · ${formatDate(item.createdAt)}</span>
      ${showUpdated ? `<span>Updated · ${formatDate(item.updatedAt)}</span>` : ""}
    </div>

  </div>
`;
}

function escapeHtml(str) {
  if (typeof str !== "string") return "";

  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toISOString().slice(0, 10);
}

/* =========================
   HANDLERS
========================= */
async function handleLock() {
  try {
    await window.vault.lock();
  } catch {
    setState(AppStates.LOCKED);
  }
}

function handleAddItem() {
  const settingsScreen = document.getElementById("settings-screen");
  // Add-item belongs to vault view, so bounce back from settings if needed.
  if (settingsScreen && !settingsScreen.hidden) {
    setHomeView(HomeViews.VAULT);
    setSettingsVisible(false);
  }

  const modal = document.getElementById("add-item-modal");
  if (!modal) return;

  modal.hidden = false;

  requestAnimationFrame(() => {
    modal.classList.add("is-open");
    document.getElementById("item-site")?.focus();
  });
}

export function bindHomeEvents() {
  const root = document.body;
  if (root.dataset.homeBound) return;
  root.dataset.homeBound = "true";

  const lockBtn = document.getElementById("lock-btn");
  const addBtn = document.getElementById("add-item-btn");
  const settingsBtn = document.getElementById("settings-btn");

  lockBtn?.addEventListener("click", handleLock);
  addBtn?.addEventListener("click", handleAddItem);
  settingsBtn?.addEventListener("click", handleOpenSettings);

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#settings-back-btn");
    if (!btn) return;
    handleBackToVault();
  });
}

export function initHomeScreen() {
  bindHomeEvents();
  initCategoryEvents();
  bindAutoLockSettings();
  bindActivityTracking();
  initAvatarMenu();
  bindItemActions();
}

function bindActivityTracking() {
  const vaultView = document.getElementById("vault-view");
  if (!vaultView) return;

  // Activity signal feeds auto-lock timer in main process.
  ["mousemove", "keydown", "mousedown"].forEach((evt) => {
    vaultView.addEventListener(evt, () => {
      window.vault.activity();
    });
  });
}

export function initAvatarMenu() {
  const avatarBtn = document.querySelector(".avatar-btn");
  const avatarMenu = document.querySelector(".avatar-menu");

  if (!avatarBtn || !avatarMenu) return;
  if (avatarBtn.dataset.bound) return;

  avatarBtn.dataset.bound = "true";

  avatarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    avatarMenu.hidden = !avatarMenu.hidden;
  });

  document.addEventListener("click", () => {
    avatarMenu.hidden = true;
  });
}
