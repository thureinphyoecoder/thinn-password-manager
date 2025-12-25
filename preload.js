const { contextBridge, ipcRenderer } = require("electron");

// Expose ONLY what renderer needs
contextBridge.exposeInMainWorld("api", {
  // example: app version (read-only)
  getAppVersion: () => ipcRenderer.invoke("app:getVersion"),

  // later: password actions (whitelisted only)
  // savePassword: (payload) => ipcRenderer.invoke('vault:save', payload),
});
