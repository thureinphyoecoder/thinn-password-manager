import { renderHome } from "../../ui/views/home.js";
import { toast } from "../../shared/components/toast.js";

// DOM references
const modal = document.getElementById("add-item-modal");
const siteInput = document.getElementById("item-site");
const urlInput = document.getElementById("item-url");
const usernameInput = document.getElementById("item-username");
const pwInput = document.getElementById("item-password");
const noteInput = modal ? modal.querySelector("textarea") : null;

// Helper to reset and close the modal UI
function resetAndCloseModal() {
  if (siteInput) siteInput.value = "";
  if (urlInput) urlInput.value = "";
  if (usernameInput) usernameInput.value = "";
  if (pwInput) pwInput.value = "";
  if (noteInput) noteInput.value = "";
  
  delete modal.dataset.editingId;
  modal.classList.remove("is-open");
  setTimeout(() => (modal.hidden = true), 200);
}

/* =========================
   ADD / UPDATE ITEM LOGIC
========================= */
export async function handleSaveItem() {
  const site = siteInput.value.trim();
  const password = pwInput.value.trim();
  if (!site || !password) return;

  const payload = {
    site,
    url: urlInput.value.trim() || "",
    username: usernameInput.value.trim() || "",
    password,
    notes: noteInput ? noteInput.value.trim() || "" : "",
  };

  const editingId = modal.dataset.editingId;
  let updatedVault;

  try {
    if (editingId) {
      updatedVault = await window.vault.updateItem(editingId, payload);
      toast("Item updated", 'success');
    } else {
      updatedVault = await window.vault.addItem(payload);
      toast("Item added", 'success');
    }

    renderHome(updatedVault);
    resetAndCloseModal();

  } catch (error) {
    console.error("Failed to save item:", error);
    toast("Save failed.", 'error');
  }
}

/* =========================
   OPEN EDIT MODAL
========================= */
export async function openEditModal(id) {
  const vault = await window.vault.loadVault();
  const item = vault.items.find((i) => i.id === id);
  if (!item) return;

  if (modal) modal.hidden = false;

  if (siteInput) siteInput.value = item.site;
  if (urlInput) urlInput.value = item.url || "";
  if (usernameInput) usernameInput.value = item.username || "";
  if (pwInput) pwInput.value = item.password || "";
  if (noteInput) noteInput.value = item.notes || ""; //  note input 

  modal.dataset.editingId = id;
  modal.classList.add("is-open");
}