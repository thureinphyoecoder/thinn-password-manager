const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("vault", {
  save: (password, data) => ipcRenderer.invoke("vault:save", password, data),
  load: (password) => ipcRenderer.invoke("vault:load", password),

  activity: () => ipcRenderer.send("vault:activity"),
});
