const fs = require("fs");
const crypto = require("crypto");
const vaultStore = require("./vaultStore");
const storage = require("./storage");
const {
  deriveKey,
  encryptWithPassword,
  decryptWithPassword,
  encryptWithKey,
  decryptWithKey,
  getKdfConfigFromPayload,
} = require("./crypto");

let sessionKey = null;
let vaultSalt = null;
let vaultKdf = null;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{1,20}$/;
const REQUIRED_ENCRYPTED_FIELDS = ["salt", "iv", "tag", "content"];

/*
 * Vault service owns encrypted persistence and in-memory unlocked session state.
 * - `sessionKey` exists only while unlocked.
 * - disk writes always store encrypted payloads.
 */

function persist() {
  if (!sessionKey) throw new Error("VAULT_LOCKED");

  const vault = vaultStore.getVault();

  const encrypted = encryptWithKey(
    JSON.stringify(vault),
    sessionKey,
    Buffer.from(vaultSalt, "hex"), // reuse SAME salt
    vaultKdf
  );

  storage.save(encrypted);
}

function validateEncryptedBlob(payload) {
  if (!payload || typeof payload !== "object") return false;
  return REQUIRED_ENCRYPTED_FIELDS.every(
    (k) => typeof payload[k] === "string" && payload[k].length > 0
  );
}

function isUnlocked() {
  return !!sessionKey;
}

async function saveVault(password, vaultData) {
  const encrypted = await encryptWithPassword(JSON.stringify(vaultData), password);

  vaultSalt = encrypted.salt;
  vaultKdf = getKdfConfigFromPayload(encrypted);
  sessionKey = await deriveKey(password, Buffer.from(vaultSalt, "hex"), vaultKdf);

  storage.save(encrypted);
  vaultStore.setVault(vaultData);
}

async function unlockVault(password) {
  const encrypted = storage.load();
  if (!encrypted || typeof encrypted !== "object") throw new Error("NO_VAULT");

  const kdf = getKdfConfigFromPayload(encrypted);
  const key = await deriveKey(password, Buffer.from(encrypted.salt, "hex"), kdf);
  const json = decryptWithKey(encrypted, key);
  if (!json) throw new Error("INVALID_PASSWORD");

  const vault = JSON.parse(json);

  sessionKey = key;
  vaultSalt = encrypted.salt;
  vaultKdf = kdf;

  vaultStore.setVault(vault);
  return vault;
}

function lockVault() {
  if (sessionKey) {
    // Best effort key scrubbing before dropping reference.
    sessionKey.fill(0);
    sessionKey = null;
  }
  vaultKdf = null;
  vaultSalt = null;
  vaultStore.setVault(null);
}

function addItem(input) {
  if (!sessionKey) throw new Error("VAULT_LOCKED");

  const vault = vaultStore.getVault();
  if (!vault) throw new Error("VAULT_NOT_LOADED");
  const now = Date.now();

  const item = {
    id: crypto.randomUUID(),
    site: input.site || "",
    username: input.username || "",
    password: input.password || "",
    url: input.url || "",
    notes: input.notes || "",
    categoryId: input.categoryId || "all",
    createdAt: now,
    updatedAt: now,
  };

  vault.items.push(item);
  persist();
  return item;
}

function updateItem(id, patch) {
  if (!sessionKey) throw new Error("VAULT_LOCKED");

  const vault = vaultStore.getVault();
  const item = vault.items.find((i) => i.id === id);
  if (!item) throw new Error("Item not found");

  Object.assign(item, patch, { updatedAt: Date.now() });
  persist();

  return item;
}

function deleteItem(id) {
  if (!sessionKey) throw new Error("VAULT_LOCKED");

  const vault = vaultStore.getVault();
  const before = vault.items.length;

  vault.items = vault.items.filter((i) => i.id !== id);
  if (vault.items.length === before) {
    throw new Error("Item not found");
  }

  persist();
  return { ok: true };
}

function updateUsername(username) {
  if (!sessionKey) throw new Error("VAULT_LOCKED");

  if (typeof username !== "string") {
    return { ok: false, message: "Username must be a string" };
  }

  const normalized = username.trim();
  if (!USERNAME_REGEX.test(normalized)) {
    return { ok: false, message: "Invalid username format" };
  }

  const vault = vaultStore.getVault();
  if (!vault) throw new Error("VAULT_NOT_LOADED");

  vault.meta = {
    ...(vault.meta || {}),
    username: normalized,
    updatedAt: Date.now(),
  };

  persist();
  return { ok: true };
}

async function changeMasterPassword(oldPassword, newPassword) {
  if (!sessionKey) {
    return { ok: false, message: "Vault is locked" };
  }

  if (typeof oldPassword !== "string" || typeof newPassword !== "string") {
    return { ok: false, message: "Password must be string" };
  }

  if (!oldPassword || !newPassword) {
    return { ok: false, message: "Both passwords are required" };
  }

  if (newPassword.length < 8) {
    return { ok: false, message: "New password must be at least 8 characters" };
  }

  const encrypted = storage.load();
  if (!encrypted || typeof encrypted !== "object") {
    return { ok: false, message: "Vault data not found" };
  }

  const oldKdf = getKdfConfigFromPayload(encrypted);
  const oldKey = await deriveKey(oldPassword, Buffer.from(encrypted.salt, "hex"), oldKdf);
  const decrypted = decryptWithKey(encrypted, oldKey);
  if (!decrypted) {
    oldKey.fill(0);
    return { ok: false, message: "Current password is incorrect" };
  }
  oldKey.fill(0);

  const vault = vaultStore.getVault();
  if (!vault) {
    return { ok: false, message: "Vault is not loaded" };
  }

  const reEncrypted = await encryptWithPassword(JSON.stringify(vault), newPassword);
  storage.save(reEncrypted);

  if (sessionKey) {
    sessionKey.fill(0);
  }

  vaultSalt = reEncrypted.salt;
  vaultKdf = getKdfConfigFromPayload(reEncrypted);
  sessionKey = await deriveKey(newPassword, Buffer.from(vaultSalt, "hex"), vaultKdf);

  return { ok: true };
}

async function exportVaultToFile(filePath, exportPassword) {
  if (!sessionKey) throw new Error("VAULT_LOCKED");

  const vault = vaultStore.getVault();
  const encrypted = await encryptWithPassword(JSON.stringify(vault), exportPassword);

  fs.writeFileSync(filePath, JSON.stringify(encrypted, null, 2));
}

async function importVaultFromFile(filePath, importPassword) {
  // Parse + shape validation first so decrypt path receives expected payload.
  let encryptedData;
  try {
    encryptedData = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    throw new Error("INVALID_VAULT_FILE");
  }

  if (!validateEncryptedBlob(encryptedData)) {
    throw new Error("INVALID_VAULT_FILE");
  }

  const json = await decryptWithPassword(encryptedData, importPassword);
  if (!json) throw new Error("INVALID_PASSWORD");

  const vault = JSON.parse(json);

  // Persist imported encrypted payload as-is and switch active session to it.
  storage.save(encryptedData);

  vaultSalt = encryptedData.salt;
  vaultKdf = getKdfConfigFromPayload(encryptedData);
  sessionKey = await deriveKey(importPassword, Buffer.from(vaultSalt, "hex"), vaultKdf);

  vaultStore.setVault(vault);
  return { ok: true };
}

module.exports = {
  saveVault,
  unlockVault,
  lockVault,
  isUnlocked,
  addItem,
  updateItem,
  deleteItem,
  updateUsername,
  changeMasterPassword,
  exportVaultToFile,
  importVaultFromFile,
};
