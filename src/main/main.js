const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const { encrypt, decrypt } = require("./vault/crypto");
const vault = require("./vault/storage");
const vaultLock = require("./vault/vaultLock");

let mainWindow; // global reference

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,

    minWidth: 960,
    minHeight: 640,

    backgroundColor: "#0e0f13",

    resizable: true,
    maximizable: true,

    show: false, // prevent flicker

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.session.clearCache();
}

/* ---------------- IPC ---------------- */

ipcMain.handle("app:getLaunchState", () => {
  if (vault.hasAccount()) {
    return { state: "LOCKED" }; // account exists
  } else {
    return { state: "NO_ACCOUNT" }; // first launch
  }
});

ipcMain.on("vault:activity", () => {
  vaultLock.markActivity();
});

ipcMain.handle("vault:save", (_, password, data) => {
  const blob = encrypt(password, data);
  vault.save(blob);
  return true;
});

ipcMain.handle("vault:load", (_, password) => {
  const blob = vault.load();
  if (!blob) return null;

  try {
    const data = decrypt(password, blob);

    vaultLock.unlockVault();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: "WRONG_PASSWORD" };
  }
});

ipcMain.handle("app:getVersion", () => {
  return app.getVersion();
});

/* ---------------- App Lifecycle ---------------- */

app.whenReady().then(() => {
  createWindow();

  vaultLock.startAutoLockTimer(() => {
    console.log("🔒 Vault auto-locked (inactivity)");
    vaultLock.lockVault();

    // နောက် မှာ သုံးမယ်
    // mainWindow.webContents.send("vault:locked");
  });
});
