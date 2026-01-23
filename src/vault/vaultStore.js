const { migrateVault } = require("./vaultMigrations");

const DEFAULT_VAULT = {
  version: 1,
  meta: {
    username: "",
    createdAt: null,
    updatedAt: null,
  },
  categories: [{ id: "all", name: "All", system: true }],
  items: [],
};

let vault = structuredClone(DEFAULT_VAULT);
const listeners = new Set();

/* =========================
   INTERNAL
========================= */
function normalizeVault(input) {
  // totally invalid
  if (!input || typeof input !== "object") {
    return structuredClone(DEFAULT_VAULT);
  }

  const version = Number(input.version) || 1;

  // 🔁 migrate older versions
  const migrated = migrateVault(input, version);

  return {
    version: 1,
    meta: {
      username: migrated.meta?.username ?? "",
      createdAt: migrated.meta?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    },
    categories:
      Array.isArray(migrated.categories) && migrated.categories.length
        ? migrated.categories
        : structuredClone(DEFAULT_VAULT.categories),
    items: Array.isArray(migrated.items) ? migrated.items : [],
  };
}

function notify() {
  listeners.forEach((fn) => fn(vault));
}

/* =========================
   PUBLIC API
========================= */
function setVault(v) {
  vault = normalizeVault(v);
  notify();
}

function getVault() {
  return vault;
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

module.exports = {
  setVault,
  getVault,
  subscribe,
};
