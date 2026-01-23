const fs = require("fs");
const crypto = require("crypto");
const vaultStore = require("./vaultStore");
const storage = require("./storage");
const { encrypt, decrypt } = require("./crypto");

let currentPassword = null;

/* ========= HELPERS ========= */

function persist() {
  if (!currentPassword) throw new Error("Vault locked");

  const vault = vaultStore.getVault();
  const json = JSON.stringify(vault);
  const encrypted = encrypt(json, currentPassword);

  // 🔐 storage expects Buffer
  storage.save(Buffer.from(JSON.stringify(encrypted), "utf8"));
}

/* ========= CORE ========= */

function isUnlocked() {
  return !!currentPassword;
}

function saveVault(password, vaultData) {
  vaultData.items ??= [];
  vaultData.categories ??= [{ id: "all", name: "All", system: true }];

  currentPassword = password;
  vaultStore.setVault(vaultData);
  persist();
}

function unlockVault(password) {
  const blob = storage.load();
  if (!blob) throw new Error("NO_VAULT");

  const encrypted = JSON.parse(blob.toString("utf8"));
  const json = decrypt(encrypted, password);
  if (!json) throw new Error("INVALID_PASSWORD");

  const vault = JSON.parse(json);

  currentPassword = password;
  vault.items ??= [];
  vault.categories ??= [{ id: "all", name: "All", system: true }];

  vaultStore.setVault(vault);
  return vault;
}

function lockVault() {
  currentPassword = null;
  vaultStore.setVault(null);
}

/* ========= ITEMS ========= */

function addItem(input) {
  if (!currentPassword) throw new Error("Vault locked");

  const vault = vaultStore.getVault();
  if (!vault) throw new Error("Vault not loaded");

  const item = {
    id: crypto.randomUUID(),
    site: input.site ?? "",
    username: input.username ?? "",
    password: input.password ?? "",
    url: input.url ?? "",
    notes: input.notes ?? "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  vault.items.push(item);
  persist();

  return item;
}

function updateItem(id, patch) {
  if (!currentPassword) throw new Error("Vault locked");

  const vault = vaultStore.getVault();
  const item = vault.items.find((i) => i.id === id);
  if (!item) throw new Error("Item not found");

  Object.assign(item, patch, { updatedAt: Date.now() });
  persist();

  return item;
}

function deleteItem(id) {
  if (!currentPassword) throw new Error("Vault locked");

  const vault = vaultStore.getVault();
  const before = vault.items.length;

  vault.items = vault.items.filter((i) => i.id !== id);
  if (vault.items.length === before) {
    throw new Error("Item not found");
  }

  persist();
  return { ok: true };
}

/* ========= EXPORT / IMPORT ========= */

function exportVaultToFile(filePath, exportPassword) {
  if (!currentPassword) throw new Error("Vault locked");

  const vault = vaultStore.getVault();
  const encrypted = encrypt(JSON.stringify(vault), exportPassword);

  fs.writeFileSync(filePath, JSON.stringify(encrypted, null, 2));
}

function importVaultFromFile(filePath, importPassword) {
  const raw = fs.readFileSync(filePath, "utf8");
  const encrypted = JSON.parse(raw);

  const json = decrypt(encrypted, importPassword);
  if (!json) throw new Error("INVALID_PASSWORD");

  const vault = JSON.parse(json);
  vaultStore.setVault(vault);
  currentPassword = null; // force re-unlock
}

/* ========= EXPORTS ========= */

module.exports = {
  saveVault,
  unlockVault,
  lockVault,
  isUnlocked,
  addItem,
  updateItem,
  deleteItem,
  exportVaultToFile,
  importVaultFromFile,
};
