const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const vault = require("./vault/storage");
const vaultLock = require("./vault/vaultLock");
const vaultService = require("./vault/vaultService");
const vaultStore = require("./vault/vaultStore");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("src/main/index.html");
}

ipcMain.handle("app:getLaunchState", () => {
  return { state: vault.hasAccount() ? "LOCKED" : "NO_ACCOUNT" };
});

ipcMain.on("SET_AUTO_LOCK", (_, ms) => {
  vaultLock.setAutoLock(ms);
});

ipcMain.on("vault:activity", () => {
  vaultLock.markActivity();
});

ipcMain.handle("vault:load", (_, password) => {
  try {
    const data = vaultService.unlockVault(password);
    vaultLock.unlockVault();
    mainWindow.webContents.send("vault:unlocked");
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
});

ipcMain.handle("vault:save", (_, password, data) => {
  vaultService.saveVault(password, data);
  vaultLock.unlockVault();
  mainWindow.webContents.send("vault:unlocked");
  return { ok: true };
});

ipcMain.handle("vault:loadVault", () => {
  return vaultStore.getVault();
});

vaultStore.subscribe(() => {
  mainWindow?.webContents.send("vault:changed");
});

app.whenReady().then(() => {
  createWindow();

  vaultLock.startAutoLockTimer(() => {
    mainWindow?.webContents.send("vault:locked");
  });
});
