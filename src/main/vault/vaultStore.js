const crypto = require("crypto");

const VAULT_VERSION = 1;

let vault = null;

/* =========================
   Init (called after unlock)
========================= */
function setVault(decryptedVault) {
  vault = decryptedVault;
}

/* =========================
   Add Item
========================= */
function addItem(input) {
  if (!vault) {
    throw new Error("Vault not initialized");
  }

  const now = Date.now();

  const item = {
    id: crypto.randomUUID(),
    site: input.site,
    username: input.username || "",
    password: input.password,
    notes: input.notes || "",
    createdAt: now,
    updatedAt: now,
  };

  vault.items.push(item);
  vault.meta.updatedAt = now;

  return item;
}

/* =========================
   Export / Import
========================= */
function exportVault() {
  if (!vault) {
    throw new Error("Vault not initialized");
  }
  return vault;
}

function importVault(data) {
  if (!data || data.version !== VAULT_VERSION || !Array.isArray(data.items)) {
    throw new Error("Invalid import data");
  }
  vault = data;
}

module.exports = {
  setVault,
  addItem,
  exportVault,
  importVault,
};
