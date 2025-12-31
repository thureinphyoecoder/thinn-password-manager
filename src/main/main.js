const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const vault = require("./vault/storage"); // ONLY for hasAccount
const vaultLock = require("./vault/vaultLock");
const vaultStore = require("./vault/vaultStore");
const vaultService = require("./vault/vaultService");

let mainWindow;
let currentPassword = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#0e0f13",
    show: false,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.webContents.openDevTools({ mode: "detach" });
  });

  mainWindow.webContents.session.clearCache();
}

/* ---------------- IPC ---------------- */

ipcMain.handle("app:getLaunchState", () => {
  return { state: vault.hasAccount() ? "LOCKED" : "NO_ACCOUNT" };
});

ipcMain.on("vault:activity", () => {
  vaultLock.markActivity();
});

/* ---------- Vault Lifecycle ---------- */
// unlock handler
ipcMain.handle("vault:load", (_, password) => {
  try {
    const data = vaultService.unlockVault(password);

    currentPassword = password; // 🔥 keep password
    vaultStore.setVault(data); // 🔥 load decrypted vault into memory

    vaultLock.unlockVault();
    mainWindow?.webContents.send("vault:unlocked");

    return { ok: true, data };
  } catch {
    return { ok: false, error: "WRONG_PASSWORD" };
  }
});

ipcMain.handle("vault:save", (_, password) => {
  vaultService.saveVault(password);
  return true;
});

/* ---------- Vault Content ---------- */

ipcMain.handle("vault:loadVault", () => {
  return {
    items: vaultStore.getItems(),
  };
});

ipcMain.handle("vault:addItem", (_, input) => {
  vaultStore.addItem(input);

  if (currentPassword) {
    vaultService.saveVault(currentPassword); // 🔥 persist now
  }

  return vaultStore.getItems();
});

ipcMain.handle("vault:export", () => {
  return vaultStore.exportVault();
});

ipcMain.handle("vault:import", (_, data) => {
  return vaultStore.importVault(data);
});

ipcMain.handle("app:getVersion", () => {
  return app.getVersion();
});

// 🔔 vaultStore change → notify renderer
vaultStore.subscribe(() => {
  if (mainWindow) {
    mainWindow.webContents.send("vault:changed");
  }
});

/* ---------------- App Lifecycle ---------------- */

app.whenReady().then(() => {
  createWindow();
  vaultLock.startAutoLockTimer(() => {
    console.log("🔒 Vault auto-locked");

    if (vaultStore.isDirty()) {
      vaultService.saveVault(currentPassword);
    }

    mainWindow?.webContents.send("vault:locked");
  });
});
