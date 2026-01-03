const crypto = require("crypto");
const vaultStore = require("./vaultStore");
const storage = require("./storage");
const { encrypt, decrypt } = require("./crypto");

let currentPassword = null;

/* =========================
   CREATE / SAVE (REGISTER)
========================= */
function saveVault(password, vaultData) {
  console.log("[vaultService] saveVault called");
  console.log("[vaultService] writing vault.bin");

  const encrypted = encrypt(password, vaultData);
  storage.save(encrypted);

  console.log("[vaultService] saveVault DONE");

  vaultStore.setVault(vaultData);
}

/* =========================
   LOAD / UNLOCK
========================= */
function unlockVault(password) {
  const blob = storage.load();
  if (!blob) throw new Error("NO_VAULT");

  const vault = decrypt(password, blob); // throws if wrong
  currentPassword = password;

  // migration safety
  vault.items ??= [];
  for (const item of vault.items) {
    item.id ??= crypto.randomUUID();
    item.createdAt ??= Date.now();
    item.updatedAt ??= Date.now();
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
}

/* =========================
   ADD
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
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  persist();
  // vaultStore.setVault(vault);
  return vault;
}

/* =========================
   UPDATE
========================= */

function updateItem(id, patch) {
  const vault = vaultStore.getVault();
  if (!vault) throw new Error("Vault not loaded");

  if (!patch || typeof patch !== "object") {
    throw new Error("INVALID_PATCH");
  }

  const item = vault.items.find((i) => i.id === id);
  if (!item) throw new Error("Item not found");

  Object.assign(item, patch, {
    updatedAt: Date.now(),
  });

  persist();
  return vault;
}

/* =========================
   DELETE
========================= */
function deleteItem(id) {
  const vault = vaultStore.getVault();
  if (!vault) throw new Error("Vault not loaded");

  vault.items = vault.items.filter((i) => i.id !== id);

  persist();
  // vaultStore.setVault(vault);
  return vault;
}

module.exports = {
  saveVault,
  unlockVault,
  addItem,
  updateItem,
  deleteItem,
};
