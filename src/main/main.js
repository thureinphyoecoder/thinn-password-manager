const { app, BrowserWindow, ipcMain, clipboard, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { encrypt, decrypt } = require("../vault/crypto");

app.disableHardwareAcceleration();

/* =========================
   VAULT MODULES
========================= */
const vaultStorage = require("../vault/storage");
const vaultService = require("../vault/vaultService");
const vaultLock = require("../vault/vaultLock");
const vaultStore = require("../vault/vaultStore");

/* =========================
   WINDOW
========================= */
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 960,
    minHeight: 640,
    resizable: true,
    maximizable: true,
    titleBarStyle: "default",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("src/main/index.html");
}

/* =========================
   APP STATE
========================= */
ipcMain.handle("app:getLaunchState", () => {
  return {
    state: vaultStorage.hasAccount() ? "LOCKED" : "NO_ACCOUNT",
  };
});

/* =========================
   AUTO LOCK
========================= */
ipcMain.on("SET_AUTO_LOCK", (_, ms) => {
  vaultLock.setAutoLock(ms);
});

ipcMain.on("vault:activity", () => {
  vaultLock.markActivity();
});

/* =========================
   VAULT LIFECYCLE
========================= */
ipcMain.handle("vault:load", (_, password) => {
  try {
    const vault = vaultService.unlockVault(password);
    vaultLock.unlockVault();
    mainWindow.webContents.send("vault:unlocked");
    return { ok: true, data: vault };
  } catch (err) {
    return { ok: false, message: "Invalid password" };
  }
});

ipcMain.handle("vault:save", (_, { password, data }) => {
  if (typeof password !== "string") {
    throw new Error("Password must be string");
  }

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

/* =========================
   ITEMS
========================= */
ipcMain.handle("vault:addItem", (_e, payload) => {
  return vaultService.addItem(payload);
});

ipcMain.handle("vault:updateItem", (_e, id, patch) => {
  return vaultService.updateItem(id, patch);
});

ipcMain.handle("vault:deleteItem", (_e, id) => {
  return vaultService.deleteItem(id);
});

ipcMain.handle("vault:copy", (_e, { id, key }) => {
  const vault = vaultStore.getVault();
  if (!vault) throw new Error("Vault not loaded");

  const item = vault.items.find((i) => i.id === id);
  if (!item || typeof item[key] !== "string") return false;

  clipboard.writeText(item[key]);
  return true;
});

/* =========================
   FILE PICKERS
========================= */
ipcMain.handle("vault:pickExportFile", async () => {
  const result = await dialog.showSaveDialog({
    defaultPath: "vault.thinn",
    filters: [{ name: "Vault", extensions: ["vault", "thinn"] }],
  });

  return result.canceled ? null : result.filePath;
});

ipcMain.handle("vault:pickImportFile", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Vault", extensions: ["vault", "thinn"] }],
  });

  return result.canceled ? null : result.filePaths[0];
});

/* =========================
   EXPORT / IMPORT (PASSWORD PROTECTED)
========================= */
ipcMain.handle("vault:export", async (_, { filePath, exportPassword }) => {
  const vault = vaultStore.getVault();
  if (!vault) throw new Error("Vault locked");

  if (typeof exportPassword !== "string" || exportPassword.length < 8) {
    throw new Error("Export password must be at least 8 characters");
  }

  if (!filePath) throw new Error("No export path");

  const json = JSON.stringify(vault);
  const encrypted = encrypt(json, exportPassword);

  fs.writeFileSync(filePath, JSON.stringify(encrypted), "utf8");

  return { ok: true };
});

ipcMain.handle("vault:import", async (_, { filePath, password }) => {
  const raw = fs.readFileSync(filePath, "utf8");
  const encrypted = JSON.parse(raw);

  const json = decrypt(encrypted, password);
  if (!json) throw new Error("Invalid import password");

  const vault = JSON.parse(json);
  vaultStore.setVault(vault);

  return { ok: true, vault };
});

/* =========================
   ACCOUNT
========================= */
ipcMain.handle("vault:updateUsername", (_e, username) => {
  return vaultService.updateUsername(username);
});

ipcMain.handle("vault:changeMasterPassword", (_e, { oldPassword, newPassword }) => {
  return vaultService.changeMasterPassword(oldPassword, newPassword);
});

/* =========================
   APP BOOT
========================= */
app.whenReady().then(() => {
  createWindow();

  vaultLock.startAutoLockTimer(() => {
    mainWindow?.webContents.send("vault:locked");
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
