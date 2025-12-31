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
  } else {
    emptyState.hidden = true;
    list.hidden = false;
  }
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
