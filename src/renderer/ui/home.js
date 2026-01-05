import { setHomeView, HomeViews, setState, AppStates } from "../state/state.js";
import { initSettingsTabs } from "./settings.js";
import { initCategoryEvents } from "../features/categories/categoryEvents.js";
import { initAccountSettings } from "../features/account/account.js";

import { copyIcon, checkIcon, eyeIcon, editIcon, trashIcon } from "../shared/icon.js";
import { bindItemActions } from "../features/items/itemEvents.js";

/* =========================
   DOM REFERENCES (HOME)
========================= */
const lockBtn = document.getElementById("lock-btn");
const addBtn = document.getElementById("add-item-btn");
const emptyState = document.getElementById("vault-empty");
const list = document.getElementById("vault-list");

const autoLockRadios = document.querySelectorAll("input[name='autoLock']");

const AUTOLOCK_KEY = "thinn:autoLock";

const searchInput = document.querySelector(".header-search");
let lastVault = null;

function bindAutoLockSettings() {
  const saved = Number(localStorage.getItem(AUTOLOCK_KEY) ?? 30000);

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

  const settingsScreen = document.getElementById("settings-screen");
  const vaultView = document.getElementById("vault-view");
  const settingsBtn = document.getElementById("settings-btn");

  vaultView && (vaultView.hidden = true);
  settingsScreen && (settingsScreen.hidden = false);
  settingsBtn?.classList.add("active");

  requestAnimationFrame(() => {
    initSettingsTabs(); // 🔥 MUST be here
    initAccountSettings();
    bindAutoLockSettings();
  });
}

function handleBackToVault() {
  setHomeView(HomeViews.VAULT);

  const settingsScreen = document.getElementById("settings-screen");
  const vaultView = document.getElementById("vault-view");
  const settingsBtn = document.getElementById("settings-btn");

  settingsScreen && (settingsScreen.hidden = true);
  vaultView && (vaultView.hidden = false);
  settingsBtn?.classList.remove("active");

  requestAnimationFrame(() => {
    bindHomeEvents();
    initAvatarMenu(); // 🔥 THIS FIXES AVATAR
  });
}

/* =========================
   RENDER
========================= */
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

  // =========================
  // EXISTING LOGIC (DON'T TOUCH)
  // =========================
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
  bindItemActions();
}

function renderFilteredItems(items) {
  const q = searchInput?.value.trim().toLowerCase() || "";

  const filtered = q
    ? items.filter((item) =>
        [item.site, item.username, item.url]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(q))
      )
    : items;

  if (filtered.length === 0) {
    list.innerHTML = `<div class="vault-empty-search">No results</div>`;
    return;
  }

  const sorted = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);

  list.innerHTML = sorted.map(renderItemCard).join("");
}

/* =========================
   ITEM CARD
========================= */
function renderRow(label, value, key) {
  return `
    <div class="vault-row">
      <div class="row-label">${label}</div>
      <div class="row-value">${value}</div>

      <div class="row-actions">
        <button class="icon-btn sm copy-btn"
                data-copy="${key}">
          ${copyIcon()}
        </button>
      </div>
    </div>
  `;
}

function renderItemCard(item) {
  const site = escapeHtml(item.site || "");
  const url = escapeHtml(item.url || "");
  const username = escapeHtml(item.username || "");
  const avatar = site ? site[0].toUpperCase() : "?";

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
      <span>Updated · ${formatDate(item.updatedAt)}</span>
    </div>

  </div>
`;
}

function row(label, value, key) {
  return `
    <div class="vault-row">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
      <div class="actions">
        <button class="icon-btn copy-btn" data-copy="${key}">
          ${copyIcon()}
        </button>
      </div>
    </div>
  `;
}

/* =========================
   HELPERS
========================= */

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
function handleLock() {
  setState(AppStates.LOCKED);
}

function handleAddItem() {
  const modal = document.getElementById("add-item-modal");
  if (!modal) return;

  modal.hidden = false;

  requestAnimationFrame(() => {
    modal.classList.add("is-open");
    document.getElementById("item-site")?.focus();
  });
}

function openEditModal(id) {
  // next step: load item data & open modal
  console.log("Edit item:", id);
}

function toast(msg) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.position = "fixed";
  el.style.bottom = "24px";
  el.style.right = "24px";
  el.style.padding = "10px 14px";
  el.style.borderRadius = "10px";
  el.style.background = "rgba(0,0,0,.8)";
  el.style.color = "#fff";
  el.style.fontSize = "13px";
  el.style.zIndex = 9999;

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

/* =========================
   BIND
========================= */
export function bindHomeEvents() {
  const lockBtn = document.getElementById("lock-btn");
  const addBtn = document.getElementById("add-item-btn");
  const settingsBtn = document.getElementById("settings-btn"); // 🔥 MUST

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
}

function bindActivityTracking() {
  const vaultView = document.getElementById("vault-view");
  if (!vaultView) return;

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

  avatarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    avatarMenu.hidden = !avatarMenu.hidden;
  });

  document.addEventListener("click", () => {
    avatarMenu.hidden = true;
  });
}
