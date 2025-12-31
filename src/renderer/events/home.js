import { showScreen } from "../ui.js";

/* =========================
   DOM REFERENCES (HOME)
========================= */
const lockBtn = document.getElementById("lock-btn");
const addBtn = document.getElementById("add-item-btn");
const emptyState = document.getElementById("vault-empty");
const list = document.getElementById("vault-list");

/* =========================
   RENDER
========================= */
export function renderHome(vault) {
  if (!vault || !vault.items || vault.items.length === 0) {
    emptyState.hidden = false;
    list.hidden = true;
    list.innerHTML = "";
    return;
  }

  emptyState.hidden = true;
  list.hidden = false;
  list.innerHTML = vault.items.map(renderItemCard).join("");
}

function renderItemCard(item) {
  return `
    <div class="vault-card">
      <div class="vault-card__site">${escapeHtml(item.site)}</div>
      <div class="vault-card__username">${escapeHtml(item.username || "")}</div>
    </div>
  `;
}

function escapeHtml(str = "") {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* =========================
   HANDLERS
========================= */
function handleLock() {
  showScreen("unlock");
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

/* =========================
   BIND
========================= */
export function bindHomeEvents() {
  lockBtn?.addEventListener("click", handleLock);
  addBtn?.addEventListener("click", handleAddItem);
}
