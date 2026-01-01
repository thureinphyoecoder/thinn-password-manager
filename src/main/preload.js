const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("vault", {
  /* ---------- App ---------- */
  getLaunchState: () => ipcRenderer.invoke("app:getLaunchState"),

  /* ---------- Vault Lifecycle ---------- */
  save: (password, data) => ipcRenderer.invoke("vault:save", password, data),
  load: (password) => ipcRenderer.invoke("vault:load", password),

  /* ---------- Auto Lock (ONLY ONE SYSTEM) ---------- */
  setAutoLock: (ms) => ipcRenderer.send("SET_AUTO_LOCK", ms),
  activity: () => ipcRenderer.send("vault:activity"),

  /* ---------- Vault Data ---------- */
  loadVault: () => ipcRenderer.invoke("vault:loadVault"),
  addItem: (input) => ipcRenderer.invoke("vault:addItem", input),
  deleteItem: (id) => ipcRenderer.invoke("vault:delete", id),
  copyField: (id, key) => ipcRenderer.invoke("vault:copy", { id, key }),

  /* ---------- Events ---------- */
  onLocked: (cb) => ipcRenderer.on("vault:locked", cb),
  onUnlocked: (cb) => ipcRenderer.on("vault:unlocked", cb),
  onChanged: (cb) => ipcRenderer.on("vault:changed", cb),
});
