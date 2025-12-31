const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

app.setName("thinn-password-manager");

const vault = require("./vault/storage"); // hasAccount only
const vaultLock = require("./vault/vaultLock");
const vaultStore = require("./vault/vaultStore");
const vaultService = require("./vault/vaultService");

let mainWindow;

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
}

/* ---------------- IPC ---------------- */

ipcMain.handle("app:getLaunchState", () => {
  return { state: vault.hasAccount() ? "LOCKED" : "NO_ACCOUNT" };
});

ipcMain.on("vault:activity", () => {
  vaultLock.markActivity();
});

/* ---------- Vault Create / Save ---------- */
ipcMain.handle("vault:save", async (_event, password, vaultData) => {
  try {
    vaultService.saveVault(password, vaultData);

    // ✅ account created → unlocked state
    vaultLock.unlockVault();
    mainWindow?.webContents.send("vault:unlocked");

    return { ok: true };
  } catch (err) {
    console.error("[vault:save]", err);
    return { ok: false, error: err.message };
  }
});

/* ---------- Vault Lifecycle ---------- */

ipcMain.handle("vault:load", (_, password) => {
  try {
    const vaultData = vaultService.unlockVault(password);
    vaultLock.unlockVault();
    mainWindow?.webContents.send("vault:unlocked");
    return { ok: true, data: vaultData };
  } catch {
    return { ok: false, error: "WRONG_PASSWORD" };
  }
});

/* ---------- Vault Content ---------- */

ipcMain.handle("vault:loadVault", () => {
  return vaultStore.getVault(); // ✅ ONLY source of truth
});

ipcMain.handle("vault:addItem", (_, payload) => {
  return vaultService.addItem(payload);
});

ipcMain.handle("vault:delete", (_, id) => {
  return vaultService.deleteItem(id);
});

/* ---------- App ---------- */

ipcMain.handle("app:getVersion", () => {
  return app.getVersion();
});

/* ---------- Store → Renderer Sync ---------- */

vaultStore.subscribe(() => {
  mainWindow?.webContents.send("vault:changed");
});

/* ---------- App Lifecycle ---------- */

app.whenReady().then(() => {
  createWindow();

  vaultLock.startAutoLockTimer(() => {
    mainWindow?.webContents.send("vault:locked");
  });
});
