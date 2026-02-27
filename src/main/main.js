const { app, BrowserWindow, ipcMain, clipboard, dialog, session } = require("electron");
const path = require("path");

app.disableHardwareAcceleration();

/* =========================
   VAULT MODULES
========================= */
const vaultStorage = require("../vault/storage");
const vaultService = require("../vault/vaultService");
const vaultLock = require("../vault/vaultLock");
const vaultStore = require("../vault/vaultStore");
const CLIPBOARD_CLEAR_MS = 30_000;
let clipboardTimer = null;
let lastAppCopiedText = null;
let unlockFailCount = 0;
let unlockBlockedUntil = 0;
const MAX_UNLOCK_BACKOFF_MS = 30_000;

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
    icon: path.join(__dirname, "../../build/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      devTools: !app.isPackaged,
      spellcheck: false,
    },
  });

  mainWindow.loadFile("src/main/index.html");
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.on("will-navigate", (event) => {
    event.preventDefault();
  });

  // Max-security default: lock immediately when app is minimized.
  mainWindow.on("minimize", () => {
    vaultLock.lockVault();
  });
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
ipcMain.handle("vault:load", async (_, password) => {
  const now = Date.now();
  if (now < unlockBlockedUntil) {
    const waitSeconds = Math.ceil((unlockBlockedUntil - now) / 1000);
    return { ok: false, message: `Too many attempts. Try again in ${waitSeconds}s` };
  }

  try {
    await vaultService.unlockVault(password);
    vaultLock.unlockVault();
    unlockFailCount = 0;
    unlockBlockedUntil = 0;
    mainWindow.webContents.send("vault:unlocked");
    return { ok: true };
  } catch {
    unlockFailCount += 1;
    const backoff = Math.min(500 * 2 ** (unlockFailCount - 1), MAX_UNLOCK_BACKOFF_MS);
    unlockBlockedUntil = Date.now() + backoff;
    return { ok: false, message: "Invalid password" };
  }
});

ipcMain.handle("vault:save", async (_, { password, data }) => {
  if (typeof password !== "string") {
    throw new Error("Password must be string");
  }

  await vaultService.saveVault(password, data);
  vaultLock.unlockVault();
  mainWindow.webContents.send("vault:unlocked");
  return { ok: true };
});

ipcMain.handle("vault:lock", () => {
  clearClipboardIfOwned();
  vaultService.lockVault();
  vaultLock.lockVault();
  return { ok: true };
});

ipcMain.handle("vault:loadVault", () => {
  if (!vaultService.isUnlocked()) return null;

  const vault = vaultStore.getVault();
  if (!vault) return null;

  return JSON.parse(JSON.stringify(vault));
});

vaultStore.subscribe(() => {
  if (!vaultService.isUnlocked()) return;
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
  scheduleClipboardClear(item[key]);
  return true;
});

ipcMain.handle("vault:getField", (_e, { id, key }) => {
  const vault = vaultStore.getVault();
  if (!vault) throw new Error("Vault not loaded");

  const item = vault.items.find((i) => i.id === id);
  if (!item || typeof item[key] !== "string") return null;
  return item[key];
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
  if (typeof exportPassword !== "string" || exportPassword.length < 8) {
    throw new Error("Export password must be at least 8 characters");
  }

  if (!filePath) throw new Error("No export path");

  await vaultService.exportVaultToFile(filePath, exportPassword);
  return { ok: true };
});

ipcMain.handle("vault:import", async (_, { filePath, password }) => {
  await vaultService.importVaultFromFile(filePath, password);
  vaultLock.unlockVault();
  mainWindow?.webContents.send("vault:unlocked");

  return { ok: true };
});

/* =========================
   ACCOUNT
========================= */
ipcMain.handle("vault:updateUsername", async (_e, username) => {
  try {
    return await vaultService.updateUsername(username);
  } catch {
    return { ok: false, message: "Failed to update username" };
  }
});

ipcMain.handle("vault:changeMasterPassword", async (_e, { oldPassword, newPassword }) => {
  try {
    return await vaultService.changeMasterPassword(oldPassword, newPassword);
  } catch {
    return { ok: false, message: "Failed to change password" };
  }
});

/* =========================
   APP BOOT
========================= */
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  createWindow();

  vaultLock.startAutoLockTimer(() => {
    clearClipboardIfOwned();
    vaultService.lockVault();
    mainWindow?.webContents.send("vault:locked");
  });
});

app.on("window-all-closed", () => {
  clearClipboardIfOwned();
  if (process.platform !== "darwin") app.quit();
});

function scheduleClipboardClear(copiedText) {
  if (clipboardTimer) clearTimeout(clipboardTimer);
  lastAppCopiedText = copiedText;

  clipboardTimer = setTimeout(() => {
    try {
      const current = clipboard.readText();
      // Clear only if clipboard still holds app-copied content.
      if (current && current === copiedText && current === lastAppCopiedText) {
        clipboard.clear();
        lastAppCopiedText = null;
      }
    } catch {
      // Ignore clipboard read/clear failures.
    } finally {
      clipboardTimer = null;
    }
  }, CLIPBOARD_CLEAR_MS);
}

function clearClipboardIfOwned() {
  try {
    if (clipboardTimer) {
      clearTimeout(clipboardTimer);
      clipboardTimer = null;
    }

    const current = clipboard.readText();
    if (current && current === lastAppCopiedText) {
      clipboard.clear();
    }
    lastAppCopiedText = null;
  } catch {
    // Ignore clipboard clear failures.
  }
}
