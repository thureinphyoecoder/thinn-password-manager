let vault = { items: [] };
let dirty = false;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn(vault));
}

function setVault(v) {
  vault = v;
  notify(); // unlock / import
}

function addItem(item) {
  vault.items.push(item);
  dirty = true;
  notify(); // ✅ THIS triggers UI update
}

function getItems() {
  return vault.items;
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function isDirty() {
  return dirty;
}

function markClean() {
  dirty = false;
}

function getVault() {
  return vault;
}

module.exports = {
  setVault,
  addItem,
  getItems,
  getVault,
  isDirty,
  markClean,
  subscribe,
};
