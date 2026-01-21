const DEFAULT_VAULT = {
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
  if (!input || typeof input !== "object") {
    return structuredClone(DEFAULT_VAULT);
  }

  return {
    meta: {
      username: input.meta?.username ?? "",
      createdAt: input.meta?.createdAt ?? Date.now(),
      updatedAt: input.meta?.updatedAt ?? Date.now(),
    },
    categories:
      Array.isArray(input.categories) && input.categories.length
        ? input.categories
        : structuredClone(DEFAULT_VAULT.categories),
    items: Array.isArray(input.items) ? input.items : [],
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
