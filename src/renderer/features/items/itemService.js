import { renderHome } from "../../ui/views/home.js";
import { toast } from "../../shared/components/toast.js";
import { CategoryState } from "../../features/categories/categoryState.js";

const modal = document.getElementById("add-item-modal");
const siteInput = document.getElementById("item-site");
const urlInput = document.getElementById("item-url");
const usernameInput = document.getElementById("item-username");
const categorySelect = document.getElementById("item-category");
const pwInput = document.getElementById("item-password");
const noteInput = modal ? modal.querySelector("textarea") : null;

function getSafeCategoryId(categoryId) {
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

function openModal() {
  if (!modal) return;
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add("is-open"));
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("is-open");
  setTimeout(() => {
    modal.hidden = true;
  }, 200);
}

renderCategoryOptions(getSafeCategoryId(CategoryState.activeCategoryId || "all"));

function resetAndCloseModal() {
  if (siteInput) siteInput.value = "";
  if (urlInput) urlInput.value = "";
  if (usernameInput) usernameInput.value = "";
  if (categorySelect) {
    const selected = getSafeCategoryId(CategoryState.activeCategoryId || "all");
    renderCategoryOptions(selected);
  }
  if (pwInput) pwInput.value = "";
  if (noteInput) noteInput.value = "";

  if (modal) {
    delete modal.dataset.editingId;
    delete modal.dataset.categoryId;
  }

  closeModal();
}

export async function handleSaveItem() {
  if (!modal || !siteInput || !pwInput) return;

  const site = siteInput.value.trim();
  const password = pwInput.value.trim();
  if (!site || !password) return;

  const payload = {
    site,
    url: urlInput.value.trim() || "",
    username: usernameInput.value.trim() || "",
    password,
    notes: noteInput ? noteInput.value.trim() || "" : "",
    categoryId: getSafeCategoryId(categorySelect?.value || CategoryState.activeCategoryId || "all"),
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

    // Re-render from persisted source to keep UI in sync with single source of truth.
    const vault = await window.vault.loadVault();
    renderHome(vault);
    resetAndCloseModal();
  } catch (error) {
    console.error("Failed to save item:", error);
    toast("Save failed.", "error");
  }
}

export async function openEditModal(id) {
  if (!modal) return;

  const vault = await window.vault.loadVault();
  const item = vault.items.find((i) => i.id === id);
  if (!item) return;

  openModal();

  if (siteInput) siteInput.value = item.site;
  if (urlInput) urlInput.value = item.url || "";
  if (usernameInput) usernameInput.value = item.username || "";
  renderCategoryOptions(getSafeCategoryId(item.categoryId || "all"));
  if (pwInput) pwInput.value = item.password || "";
  if (noteInput) noteInput.value = item.notes || "";

  modal.dataset.editingId = id;
  modal.dataset.categoryId = item.categoryId || "all";
}
