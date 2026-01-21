import { CategoryState } from "./categoryState.js";
import { renderCategories } from "../../ui/index.js";
import { persistCategories } from "./categoryState.js";

import { openConfirm } from "../../shared/utils/confirm.js";

let openedCategoryId = null;

let menu = null;

let isInitialLized = false;

/* ======================
   INIT
====================== */
export function initCategoryEvents() {
  if (isInitialLized) {
    return;
  }

  // context menu
  menu = document.getElementById("category-context-menu");
  if (!menu) {
    console.warn("[Categories] context menu not found");
  }

  // add category button
  document.getElementById("add-category-btn")?.addEventListener("click", handleAddCategory);

  //  INLINE INPUT KEY HANDLER (ဒီနေရာ!)
  const input = document.getElementById("category-input");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitCategory();
      if (e.key === "Escape") closeCategoryInput();
    });
  } else {
    console.warn("[Categories] category-input not found");
  }

  // global click
  document.addEventListener("click", handleGlobalClick);

  // escape closes menu
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  isInitialLized = true;
}

/* ======================
   HANDLERS
====================== */

function openCategoryInput() {
  const row = document.querySelector(".category-input-row");
  const input = document.getElementById("category-input");

  row.hidden = false;
  input.value = "";
  input.focus();
}

function submitCategory() {
  const input = document.getElementById("category-input");
  const name = input.value.trim();
  if (!name) return;

  const id = crypto.randomUUID();

  CategoryState.categories.push({ id, name });
  CategoryState.activeCategoryId = id;

  closeCategoryInput();
  renderCategories();
  persistCategories();
}

function closeCategoryInput() {
  const row = document.querySelector(".category-input-row");
  row.hidden = true;
}

function handleAddCategory(e) {
  e.stopPropagation();
  openCategoryInput(); 
}

function handleGlobalClick(e) {
  //  MENU ACTION FIRST 
  const actionBtn = e.target.closest(".dropdown-item");
  if (actionBtn) {
    handleMenuAction(actionBtn.dataset.action);
    return;
  }

  // open menu
  const moreBtn = e.target.closest(".category-more-btn");
  if (moreBtn) {
    e.stopPropagation();
    const row = moreBtn.closest(".category-item");
    openedCategoryId = row.dataset.categoryId;
    openMenuAt(moreBtn);
    return;
  }

  // select category (not during rename)
  const row = e.target.closest(".category-item");
  if (row && !row.classList.contains("rename-active")) {
    CategoryState.activeCategoryId = row.dataset.categoryId;
    renderCategories();
    closeMenu();
    return;
  }

  // click inside menu but not on item → do nothing
  if (e.target.closest("#category-context-menu")) {
    return;
  }

  // outside
  closeMenu();
}

/* ======================
   MENU
====================== */
function clearMenuHighlight() {
  document.querySelector(".category-item.menu-open")?.classList.remove("menu-open");
}

function openMenuAt(btn) {
  if (!menu) return;

  // clear previous highlight
  clearMenuHighlight();

  // highlight current row
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

/* ======================
   ACTIONS
====================== */
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

  // update state
  cat.name = name.trim();
  persistCategories();

  // update DOM ONLY (no re-render)
  const label = row.querySelector(".category-label");
  if (label) {
    label.textContent = cat.name;
  }
}
