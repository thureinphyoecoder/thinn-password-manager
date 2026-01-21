const { app, BrowserWindow, ipcMain, clipboard, dialog } = require("electron");
app.disableHardwareAcceleration();

const fs = require("fs");
const path = require("path");

const { encrypt, decrypt } = require("../vault/crypto");

const vaultStorage = require("../vault/storage");
const vaultLock = require("../vault/vaultLock");
const vaultService = require("../vault/vaultService");
const vaultStore = require("../vault/vaultStore");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,

    minWidth: 960, //  critical
    minHeight: 640, //  critical

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
  return { state: vaultStorage.hasAccount() ? "LOCKED" : "NO_ACCOUNT" };
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
  } catch (err) {
    return {
      ok: false,
      message: err?.message || "Invalid password",
    };
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

  //  field
  const value = item[key];

  if (typeof value !== "string" || value.length === 0) {
    return false;
  }

  if (!value) throw new Error("Nothing to copy");

  clipboard.writeText(String(value));
  return true;
});

ipcMain.handle("vault:export", async (_, password) => {
  const vault = vaultStore.getVault();
  if (!vault) throw new Error("NO_VAULT");

  const { filePath, canceled } = await dialog.showSaveDialog({
    filters: [{ name: "Thinn Vault", extensions: ["thinn"] }],
  });

  if (canceled) return;

  const encrypted = encrypt(password, vault); // already encrypted in memory
  fs.writeFileSync(filePath, encrypted);

  return true;
});

ipcMain.handle("vault:import", async (_, password) => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Thinn Vault", extensions: ["thinn"] }],
  });

  if (canceled) return;

  const blob = fs.readFileSync(filePaths[0]);
  const importedVault = decrypt(password, blob); // throws if wrong

  // schema safety
  importedVault.items ??= [];
  importedVault.categories ??= { list: [], activeCategoryId: "all" };

  vaultStore.setVault(importedVault);
  vaultStorage.save(blob);

  return importedVault;
});

ipcMain.handle("vault:updateUsername", (_e, newUsername) => {
  try {
    const updatedVault = vaultService.updateUsername(newUsername);

    return { ok: true };
  } catch (err) {
    throw err;
  }
});

//  MASTER PASSWORD CHANGE
ipcMain.handle("vault:changeMasterPassword", (_e, { oldPassword, newPassword }) => {
  try {
    vaultService.changeMasterPassword(oldPassword, newPassword);
    return { ok: true };
  } catch (err) {
    
    return { 
      ok: false, 
      message: err?.message || "Password change failed" 
    };
  }
});
app.whenReady().then(() => {
  createWindow();

  vaultLock.startAutoLockTimer(() => {
    mainWindow?.webContents.send("vault:locked");
  });
});
