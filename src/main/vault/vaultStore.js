let vault = { items: [] };
const listeners = new Set();

/* =========================
   INTERNAL
========================= */
function notify() {
  listeners.forEach((fn) => fn(vault));
}

/* =========================
   PUBLIC API
========================= */
function setVault(v) {
  vault = v || { items: [] };
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
