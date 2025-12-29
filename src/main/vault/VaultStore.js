const storage = require("./storage");

const VAULT_VERSION = 1;

let vault = null;

function createEmptyVault(username = "") {
  const now = Date.now();
  return {
    version: VAULT_VERSION,
    meta: {
      username,
      createdAt: now,
      updatedAt: now,
    },
    items: [],
  };
}

/* =========================
   Load
========================= */
function loadVault() {
  const raw = storage.load();
  if (!raw) {
    vault = createEmptyVault();
    persist();
    return vault;
  }

  const data = JSON.parse(raw.toString("utf-8"));

  if (!isValidVault(data)) {
    throw new Error("Invalid vault schema");
  }

  vault = data;
  return vault;
}

/* =========================
   Save
========================= */
function persist() {
  storage.save(Buffer.from(JSON.stringify(vault, null, 2)));
}

/* =========================
   Add Item
========================= */
function addItem(input) {
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

  persist();
  return item;
}

/* =========================
   Import / Export (READY)
========================= */
function exportVault() {
  return vault;
}

function importVault(data) {
  if (!isValidVault(data)) {
    throw new Error("Invalid import data");
  }
  vault = data;
  persist();
}

/* =========================
   Validation
========================= */
function isValidVault(v) {
  return (
    v &&
    v.version === VAULT_VERSION &&
    v.meta &&
    typeof v.meta.username === "string" &&
    Array.isArray(v.items)
  );
}

module.exports = {
  loadVault,
  addItem,
  exportVault,
  importVault,
};
