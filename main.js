const { app, BrowserWindow, ipMain, ipcMain } = require("electron");

const { encrypt, decrypt } = require("./src/main/vault/crypto");
const vault = require("./src/main/vault/storage");

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: __dirname + "/preload.js",
      nodeIntegration: false, // လုံခြုံရေးအတွက်
      contextIsolation: true,
    },
  });

  win.loadFile("index.html");
}

ipcMain.handle("vault:save", (_, password, data) => {
  const blob = encrypt(password, data);
  vault.save(blob);
  return true;
});

ipcMain.handle("vault:load", (_, password) => {
  const blob = vault.load();
  if (!blob) return null;
  return decrypt(password, blob);
});

ipcMain.handle("app:getVersion", () => {
  return app.getVersion();
});

app.whenReady().then(createWindow);
