import { renderHome } from "../../ui/home.js";
import { openConfirm } from "../../shared/confirm.js";

console.log("ITEM EVENTS CONFIRM =", openConfirm);

/* =========================
   ADD / UPDATE
========================= */

export function bindAddItemEvents() {
  const modal = document.getElementById("add-item-modal");

  if (!modal) return;

  const saveBtn = document.getElementById("save-item-btn");
  if (!saveBtn) return;

  const siteInput = document.getElementById("item-site");
  const urlInput = document.getElementById("item-url");
  const usernameInput = document.getElementById("item-username");
  const pwInput = document.getElementById("item-password");
  const noteInput = modal.querySelector("textarea");

  saveBtn.onclick = async () => {
    const site = siteInput.value.trim();
    const password = pwInput.value.trim();
    if (!site || !password) return;

    const payload = {
      site,
      url: urlInput.value.trim() || "",
      username: usernameInput.value.trim() || "",
      password,
      notes: noteInput.value.trim() || "",
    };

    const editingId = modal.dataset.editingId;
    let updatedVault;

    if (editingId) {
      updatedVault = await window.vault.updateItem(editingId, payload);
      delete modal.dataset.editingId;
      toast("Item updated");
    } else {
      updatedVault = await window.vault.addItem(payload);
      toast("Item added");
    }

    renderHome(updatedVault);

    siteInput.value = "";
    urlInput.value = "";
    usernameInput.value = "";
    pwInput.value = "";
    noteInput.value = "";

    modal.classList.remove("is-open");
    setTimeout(() => (modal.hidden = true), 200);
  };
}

/* =========================
   ITEM ACTIONS
========================= */
export function bindItemActions() {
  const list = document.getElementById("vault-list");
  if (!list) return;

  list.addEventListener("click", async (e) => {
    const card = e.target.closest(".vault-card");
    if (!card) return;

    const id = card.dataset.id;
    if (!id) return;

    // EDIT
    if (e.target.closest("[data-action='edit']")) {
      console.log("EDIT HIT", id);
      openEditModal(id);
      return;
    }

    // DELETE
    if (e.target.closest("[data-action='delete']")) {
      openConfirm({
        title: "Delete item",
        message: "Delete this item?",
        onConfirm: async ({ showSuccess }) => {
          await window.vault.deleteItem(id);

          showSuccess("Deleted");
        },
      });
      return;
    }

    // TOGGLE PASSWORD
    if (e.target.closest("[data-action='toggle-password']")) {
      const row = card.querySelector(".vault-row.password");
      if (!row) return;

      const val = row.querySelector(".password-value");
      const pw = row.dataset.password;

      const visible = val.textContent !== "••••••••••";
      val.textContent = visible ? "••••••••••" : pw;
      return;
    }

    // COPY
    const copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) {
      const key = copyBtn.dataset.copy;
      const ok = await window.vault.copyField(id, key);
      if (ok) toast("Copied");
    }
  });
}

/* =========================
   EDIT MODAL
========================= */
async function openEditModal(id) {
  const vault = await window.vault.loadVault();
  const item = vault.items.find((i) => i.id === id);
  if (!item) return;

  const modal = document.getElementById("add-item-modal");
  modal.hidden = false;

  document.getElementById("item-site").value = item.site;
  document.getElementById("item-url").value = item.url || "";
  document.getElementById("item-username").value = item.username || "";
  document.getElementById("item-password").value = item.password || "";

  modal.dataset.editingId = id;
  modal.classList.add("is-open");
}

/* =========================
   TOAST
========================= */
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
