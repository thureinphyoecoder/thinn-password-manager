const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("vault", {
  getLaunchState: () => ipcRenderer.invoke("app:getLaunchState"),

  save: (password, data) => ipcRenderer.invoke("vault:save", password, data),

  load: (password) => ipcRenderer.invoke("vault:load", password),

  activity: () => ipcRenderer.send("vault:activity"),

  loadVault: () => ipcRenderer.invoke("vault:loadVault"),
  addItem: (input) => ipcRenderer.invoke("vault:addItem", input),
  exportVault: () => ipcRenderer.invoke("vault:export"),
  importVault: (data) => ipcRenderer.invoke("vault:import", data),

  onLocked: (cb) => ipcRenderer.on("vault:locked", cb),
  onUnlocked: (cb) => ipcRenderer.on("vault:unlocked", cb),

  onChanged: (cb) => ipcRenderer.on("vault:changed", cb),

  deleteItem: (id) => ipcRenderer.invoke("vault:delete", id),

  copyField: (id, key) => ipcRenderer.invoke("vault:copy", { id, key }),
});
