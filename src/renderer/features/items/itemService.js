import { renderHome } from "../../ui/views/home.js";
import { toast } from "../../shared/components/toast.js";
import { CategoryState } from "../../features/categories/categoryState.js";

// DOM references
const modal = document.getElementById("add-item-modal");
const siteInput = document.getElementById("item-site");
const urlInput = document.getElementById("item-url");
const usernameInput = document.getElementById("item-username");
const categorySelect = document.getElementById("item-category");
const pwInput = document.getElementById("item-password");
const noteInput = modal ? modal.querySelector("textarea") : null;

function ensureValidCategoryId(categoryId) {
  const exists = CategoryState.categories.some((c) => c.id === categoryId);
  return exists ? categoryId : "all";
}

function renderCategoryOptions(selectedId = "all") {
  if (!categorySelect) return;

  const options = CategoryState.categories
    .map((c) => {
      const selected = c.id === selectedId ? " selected" : "";
      return `<option value="${c.id}"${selected}>${c.name}</option>`;
    })
    .join("");

  categorySelect.innerHTML = options;
  categorySelect.value = selectedId;
}

renderCategoryOptions(ensureValidCategoryId(CategoryState.activeCategoryId || "all"));

// Helper to reset and close the modal UI
function resetAndCloseModal() {
  if (siteInput) siteInput.value = "";
  if (urlInput) urlInput.value = "";
  if (usernameInput) usernameInput.value = "";
  if (categorySelect) {
    const selected = ensureValidCategoryId(CategoryState.activeCategoryId || "all");
    renderCategoryOptions(selected);
  }
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
    categoryId: ensureValidCategoryId(categorySelect?.value || CategoryState.activeCategoryId || "all"),
  };

  const editingId = modal.dataset.editingId;

  try {
    if (editingId) {
      await window.vault.updateItem(editingId, payload);
      toast("Item updated", "success");
    } else {
      await window.vault.addItem(payload);
      toast("Item added", "success");
    }

    const vault = await window.vault.loadVault(); // 🔥 correct source
    renderHome(vault);
    resetAndCloseModal();
  } catch (error) {
    console.error("Failed to save item:", error);
    toast("Save failed.", "error");
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
  renderCategoryOptions(ensureValidCategoryId(item.categoryId || "all"));
  if (pwInput) pwInput.value = item.password || "";
  if (noteInput) noteInput.value = item.notes || ""; //  note input

  modal.dataset.editingId = id;
  modal.dataset.categoryId = item.categoryId || "all";

  modal.classList.add("is-open");
}
