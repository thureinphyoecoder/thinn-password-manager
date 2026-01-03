const { app, BrowserWindow, ipcMain, clipboard } = require("electron");
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

    minWidth: 960, // 🔒 critical
    minHeight: 640, // 🔒 critical

    resizable: true, // allow resize
    maximizable: true,

    titleBarStyle: "default",

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

ipcMain.handle("vault:addItem", (_e, payload) => {
  return vaultService.addItem(payload);
});

ipcMain.handle("vault:deleteItem", (_e, id) => {
  return vaultService.deleteItem(id);
});

ipcMain.handle("vault:updateItem", (_e, id, patch) => {
  return vaultService.updateItem(id, patch);
});

ipcMain.handle("vault:copy", (_e, { id, key }) => {
  const vault = vaultStore.getVault();
  if (!vault) throw new Error("Vault not loaded");

  const item = vault.items.find((i) => i.id === id);
  if (!item) throw new Error("Item not found");

  // 🔥 field တစ်ခုတည်း
  const value = item[key];

  if (typeof value !== "string" || value.length === 0) {
    return false;
  }

  if (!value) throw new Error("Nothing to copy");

  clipboard.writeText(String(value));
  return true;
});

app.whenReady().then(() => {
  createWindow();

  vaultLock.startAutoLockTimer(() => {
    mainWindow?.webContents.send("vault:locked");
  });
});
