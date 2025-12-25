const { app, BrowserWindow, ipMain, ipcMain } = require("electron");

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

ipcMain.handle("app:getVersion", () => {
  return app.getVersion();
});

app.whenReady().then(createWindow);
