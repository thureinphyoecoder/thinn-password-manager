const crypto = require("crypto");
const vaultStore = require("./vaultStore");
const storage = require("./storage");
const { encrypt, decrypt } = require("./crypto");

let currentPassword = null;

/* =========================
   CREATE / SAVE (REGISTER)
========================= */
function saveVault(password, vaultData) {
  // ---- SAFETY DEFAULTS ----
  vaultData.items ??= [];
  vaultData.categories ??= [{ id: "all", name: "All", system: true }];

  const encrypted = encrypt(password, vaultData);
  storage.save(encrypted);

  currentPassword = password;
  vaultStore.setVault(vaultData);
}

/* =========================
   LOAD / UNLOCK
========================= */
function unlockVault(password) {
  const blob = storage.load();
  if (!blob) throw new Error("NO_VAULT");

  const vault = decrypt(password, blob);
  currentPassword = password;

  // ===== MIGRATION SAFETY =====
  vault.items ??= [];
  vault.categories ??= [{ id: "all", name: "All", system: true }];

  // items safety
  for (const item of vault.items) {
    item.id ??= crypto.randomUUID();
    item.createdAt ??= Date.now();
    item.updatedAt ??= Date.now();
    item.categoryId ??= "all";
  }

  vaultStore.setVault(vault);
  return vault;
}

/* =========================
   INTERNAL PERSIST
========================= */
function persist() {
  if (!currentPassword) throw new Error("Vault locked");

  const vault = vaultStore.getVault();
  const encrypted = encrypt(currentPassword, vault);
  storage.save(encrypted);

  vaultStore.setVault(vault);
}

/* =========================
   CATEGORY
========================= */
function addCategory(name) {
  const vault = vaultStore.getVault();
  if (!vault) throw new Error("Vault not loaded");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("INVALID_CATEGORY");

  const category = {
    id: crypto.randomUUID(),
    name: trimmed,
  };

  vault.categories.push(category);
  persist();
  return category;
}

function renameCategory(id, newName) {
  const vault = vaultStore.getVault();
  const cat = vault.categories.find((c) => c.id === id);
  if (!cat || cat.system) throw new Error("INVALID_CATEGORY");

  cat.name = newName.trim();
  persist();
}

function deleteCategory(id) {
  const vault = vaultStore.getVault();
  if (id === "all") throw new Error("CANNOT_DELETE_ALL");

  vault.items.forEach((item) => {
    if (item.categoryId === id) {
      item.categoryId = "all";
    }
  });

  vault.categories = vault.categories.filter((c) => c.id !== id);
  persist();
}

/* =========================
   ITEM
========================= */
function addItem(payload) {
  const vault = vaultStore.getVault();
  if (!vault) throw new Error("Vault not loaded");

  if (!payload?.site) {
    throw new Error("INVALID_PAYLOAD");
  }

  vault.items.push({
    id: crypto.randomUUID(),
    ...payload,
    categoryId: payload.categoryId || "all",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  persist();
  return vault;
}

function updateItem(id, patch) {
  const vault = vaultStore.getVault();
  if (!vault) throw new Error("Vault not loaded");

  const item = vault.items.find((i) => i.id === id);
  if (!item) throw new Error("Item not found");

  Object.assign(item, patch, {
    updatedAt: Date.now(),
  });

  persist();
  return vault;
}

function deleteItem(id) {
  const vault = vaultStore.getVault();
  if (!vault) throw new Error("Vault not loaded");

  vault.items = vault.items.filter((i) => i.id !== id);
  persist();
  return vault;
}

/* =========================
   LOCK
========================= */
function lockVault() {
  currentPassword = null;
  vaultStore.setVault(null);
}

/* =========================
   EXPORT
========================= */
function exportVault() {
  const vault = vaultStore.getVault();
  if (!vault) throw new Error("Vault not loaded");

  // ❗ password မပါ (plain JSON)
  return {
    meta: vault.meta,
    items: vault.items,
    categories: vault.categories ?? [],
    exportedAt: Date.now(),
    version: 1,
  };
}

/* =========================
   IMPORT
========================= */

function importVault(data) {
  if (!currentPassword) throw new Error("Vault locked");

  if (!data || !Array.isArray(data.items)) {
    throw new Error("INVALID_IMPORT");
  }

  const vault = {
    meta: {
      ...data.meta,
      importedAt: Date.now(),
    },
    items: data.items,
    categories: data.categories ?? [],
  };

  vaultStore.setVault(vault);
  persist();

  return vault;
}

module.exports = {
  saveVault,
  unlockVault,
  lockVault,

  addCategory,
  renameCategory,
  deleteCategory,

  addItem,
  updateItem,
  deleteItem,

  importVault,
  exportVault,
};
