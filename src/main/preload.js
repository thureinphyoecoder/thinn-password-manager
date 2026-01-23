const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("vault", {
  /* ---------- App ---------- */
  getLaunchState: () => ipcRenderer.invoke("app:getLaunchState"),

  /* ---------- Vault Lifecycle ---------- */
  save: (password, data) => ipcRenderer.invoke("vault:save", { password, data }),
  load: (password) => ipcRenderer.invoke("vault:load", password),
  loadVault: () => ipcRenderer.invoke("vault:loadVault"),

  /* ---------- Auto Lock ---------- */
  setAutoLock: (ms) => ipcRenderer.send("SET_AUTO_LOCK", ms),
  activity: () => ipcRenderer.send("vault:activity"),

  /* ---------- Vault Data ---------- */
  addItem: (input) => ipcRenderer.invoke("vault:addItem", input),
  updateItem: (id, patch) => ipcRenderer.invoke("vault:updateItem", id, patch),
  deleteItem: (id) => ipcRenderer.invoke("vault:deleteItem", id),
  copyField: (id, key) => ipcRenderer.invoke("vault:copy", { id, key }),

  /* ---------- File Dialog ---------- */
  pickImportFile: () => ipcRenderer.invoke("vault:pickImportFile"),
  pickExportFile: () => ipcRenderer.invoke("vault:pickExportFile"),

  /* ---------- Import / Export (Auth) ---------- */

  exportVault: (payload) => ipcRenderer.invoke("vault:export", payload),

  importVault: (filePath, password) => ipcRenderer.invoke("vault:import", { filePath, password }),

  updateUsername: (newUsername) => ipcRenderer.invoke("vault:updateUsername", newUsername),
  changeMasterPassword: (oldPassword, newPassword) =>
    ipcRenderer.invoke("vault:changeMasterPassword", { oldPassword, newPassword }),

  /* ---------- Events ---------- */
  onLocked: (cb) => ipcRenderer.on("vault:locked", cb),
  onUnlocked: (cb) => ipcRenderer.on("vault:unlocked", cb),
  onChanged: (cb) => ipcRenderer.on("vault:changed", cb),
});
