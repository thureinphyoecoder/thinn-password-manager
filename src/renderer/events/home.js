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

/* =========================
   ITEM CARD
========================= */

function renderItemCard(item) {
  const site = escapeHtml(item.site || "");
  const url = escapeHtml(item.url || "");
  const username = escapeHtml(item.username || "");
  const avatar = site ? site[0].toUpperCase() : "?";

  return `
  <div class="vault-card" data-id="${item.id}">
    <!-- HEADER -->
    <div class="vault-card__top">
      <div class="vault-left">
        <div class="vault-avatar">${avatar}</div>
        <div class="vault-site">${site}</div>
      </div>

      <div class="vault-actions">
        <button class="icon-btn sm" data-action="edit" title="Edit">
          ${editIcon()}
        </button>
        <button class="icon-btn sm danger" data-action="delete" title="Delete">
          ${trashIcon()}
        </button>
      </div>
    </div>

    <!-- TABLE -->
    <table class="vault-table">
      <tbody>
        ${
          username
            ? `
          <tr class="vault-row">
            <td class="label">Username</td>
            <td class="value">${username}</td>
            <td class="action">
              <button class="copy-btn" data-copy="username">
                ${copyIcon()}
              </button>
            </td>
          </tr>`
            : ""
        }

        ${
          url
            ? `
          <tr class="vault-row">
            <td class="label">URL</td>
            <td class="value">${url}</td>
            <td class="action">
              <button class="copy-btn" data-copy="url">
                ${copyIcon()}
              </button>
            </td>
          </tr>`
            : ""
        }

        <tr class="vault-row">
          <td class="label">Password</td>
          <td class="value">••••••••••</td>
          <td class="action">
            <button class="copy-btn" data-copy="password">
              ${copyIcon()}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- DATES -->
    <div class="vault-dates">
      <span>Created · ${formatDate(item.createdAt)}</span>
      <span>Updated · ${formatDate(item.updatedAt)}</span>
    </div>
  </div>
`;
}

/* =========================
   HELPERS
========================= */

function escapeHtml(str = "") {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toISOString().slice(0, 10);
}

function editIcon() {
  return `
    <svg viewBox="0 0 24 24" width="14" height="14">
      <path d="M4 20h4l10-10-4-4L4 16v4z"
            fill="currentColor"/>
    </svg>
  `;
}

function trashIcon() {
  return `
    <svg viewBox="0 0 24 24" width="14" height="14">
      <path d="M6 7h12l-1 14H7L6 7z"
            fill="currentColor"/>
      <path d="M9 4h6l1 2H8l1-2z"
            fill="currentColor"/>
    </svg>
  `;
}

function copyIcon() {
  return `
    <svg viewBox="0 0 24 24" width="14" height="14">
      <path d="M8 8h12v12H8z"
            fill="none"
            stroke="currentColor"
            stroke-width="2"/>
      <path d="M4 4h12v12"
            fill="none"
            stroke="currentColor"
            stroke-width="2"/>
    </svg>
  `;
}

/* =========================
   Actions
========================= */
list.addEventListener("click", async (e) => {
  const card = e.target.closest(".vault-card");
  if (!card) return;

  const id = card.dataset.id;
  if (!id) return;

  // DELETE
  if (e.target.closest("[data-action='delete']")) {
    const ok = confirm("Delete this item?");
    if (!ok) return;

    const updatedVault = await window.vault.deleteItem(id);

    if (!updatedVault) {
      alert("Delete failed");
      return;
    }

    renderHome(updatedVault); // 🔥 auto refresh
    toast("Item deleted");
    return;
  }

  // EDIT
  if (e.target.closest("[data-action='edit']")) {
    openEditModal(id);
    return;
  }

  // COPY (robust, SVG-safe)
  const copyBtn = e.target.closest(".copy-btn");
  if (copyBtn) {
    const key = copyBtn.dataset.copy;
    if (!key) return;

    await window.vault.copyField(id, key);
    toast("Copied to clipboard");
  }
});

/* =========================
   HANDLERS
========================= */
function handleLock() {
  window.vault.activity();
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
  lockBtn?.addEventListener("click", handleLock);
  addBtn?.addEventListener("click", handleAddItem);
}

export function initHomeScreen() {
  console.log("[UI] initHomeScreen");

  bindHomeEvents();
}
