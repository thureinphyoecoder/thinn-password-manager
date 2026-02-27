import { CategoryState } from "./categoryState.js";
import { renderCategories } from "../../ui/index.js";
import { persistCategories } from "./categoryState.js";
import { renderHome } from "../../ui/views/home.js";
import { openConfirm } from "../../shared/utils/confirm.js";

let openedCategoryId = null;
let menu = null;
let isInitialized = false;

async function refreshVaultList() {
  const vault = await window.vault.loadVault();
  if (!vault) return;
  renderHome(vault);
}

export function initCategoryEvents() {
  if (isInitialized) return;

  menu = document.getElementById("category-context-menu");
  if (!menu) {
    console.warn("[Categories] context menu not found");
  }

  document.getElementById("add-category-btn")?.addEventListener("click", handleAddCategory);

  const input = document.getElementById("category-input");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitCategory();
      if (e.key === "Escape") closeCategoryInput();
    });
  } else {
    console.warn("[Categories] category-input not found");
  }

  document.addEventListener("click", handleGlobalClick);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  isInitialized = true;
}

function openCategoryInput() {
  const row = document.querySelector(".category-input-row");
  const input = document.getElementById("category-input");

  row.hidden = false;
  input.value = "";
  input.focus();
}

async function setActiveCategory(categoryId) {
  CategoryState.activeCategoryId = categoryId;
  renderCategories();
  await refreshVaultList();
}

async function submitCategory() {
  const input = document.getElementById("category-input");
  const name = input.value.trim();
  if (!name) return;

  const id = crypto.randomUUID();
  CategoryState.categories.push({ id, name });
  closeCategoryInput();
  persistCategories();
  await setActiveCategory(id);
}

function closeCategoryInput() {
  const row = document.querySelector(".category-input-row");
  if (row) row.hidden = true;
}

function handleAddCategory(e) {
  e.stopPropagation();
  openCategoryInput();
}

async function handleGlobalClick(e) {
  const actionBtn = e.target.closest(".dropdown-item");
  if (actionBtn) {
    handleMenuAction(actionBtn.dataset.action);
    return;
  }

  const moreBtn = e.target.closest(".category-more-btn");
  if (moreBtn) {
    e.stopPropagation();
    const row = moreBtn.closest(".category-item");
    openedCategoryId = row.dataset.categoryId;
    openMenuAt(moreBtn);
    return;
  }

  const row = e.target.closest(".category-item");
  if (row && !row.classList.contains("rename-active")) {
    await setActiveCategory(row.dataset.categoryId);
    closeMenu();
    return;
  }

  if (e.target.closest("#category-context-menu")) {
    return;
  }

  closeMenu();
}

function clearMenuHighlight() {
  document.querySelector(".category-item.menu-open")?.classList.remove("menu-open");
}

function openMenuAt(btn) {
  if (!menu) return;

  clearMenuHighlight();
  const row = btn.closest(".category-item");
  row?.classList.add("menu-open");

  const rect = btn.getBoundingClientRect();
  menu.style.top = `${rect.top}px`;
  menu.style.left = `${rect.right + 8}px`;
  menu.hidden = false;
}

function closeMenu() {
  if (!menu) return;

  clearMenuHighlight();
  menu.hidden = true;
  openedCategoryId = null;
}

function handleMenuAction(type) {
  const id = openedCategoryId;
  const cat = CategoryState.categories.find((c) => c.id === id);
  if (!cat || cat.system) return;

  const row = document.querySelector(`.category-item[data-category-id="${id}"]`);

  if (type === "rename") {
    closeMenu();
    if (row) startInlineRename(row);
    return;
  }

  if (type === "delete") {
    closeMenu();

    openConfirm({
      title: "Delete category",
      message: `Delete "${cat.name}"?`,
      onConfirm: async ({ showSuccess }) => {
        CategoryState.categories = CategoryState.categories.filter((c) => c.id !== id);

        if (CategoryState.activeCategoryId === id) {
          CategoryState.activeCategoryId = "all";
        }

        renderCategories();
        persistCategories();
        await refreshVaultList();
        showSuccess("Deleted");
      },
    });

    return;
  }
}

function startInlineRename(row) {
  const label = row.querySelector(".category-label");
  const input = row.querySelector(".category-rename-input");

  if (!label || !input) return;

  row.classList.add("rename-active");
  label.hidden = true;
  input.hidden = false;

  input.value = label.textContent;
  input.focus();
  input.select();

  function cleanup(commit = false) {
    row.classList.remove("rename-active");
    input.hidden = true;
    label.hidden = false;

    if (commit) {
      commitRename(row, input.value);
    } else {
      input.value = label.textContent;
    }

    input.removeEventListener("keydown", onKey);
    input.removeEventListener("blur", onBlur);
  }

  function onKey(e) {
    if (e.key === "Enter") cleanup(true);
    if (e.key === "Escape") cleanup(false);
  }

  function onBlur() {
    cleanup(true);
  }

  input.addEventListener("keydown", onKey);
  input.addEventListener("blur", onBlur);
}

function commitRename(row, name) {
  const id = row.dataset.categoryId;
  const cat = CategoryState.categories.find((c) => c.id === id);
  if (!cat || !name.trim()) return;

  cat.name = name.trim();
  persistCategories();

  const label = row.querySelector(".category-label");
  if (label) {
    label.textContent = cat.name;
  }
}
