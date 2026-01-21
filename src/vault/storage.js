const fs = require("fs");
const path = require("path");
const { app } = require("electron");

let vaultFilePath = null;

function getVaultFile() {
  if (!vaultFilePath) {
    vaultFilePath = path.join(app.getPath("userData"), "vault.bin");
    console.log("[vault] vaultFile =", vaultFilePath);
  }
  return vaultFilePath;
}

function save(blob) {
  fs.writeFileSync(getVaultFile(), blob);
}

function load() {
  if (!fs.existsSync(getVaultFile())) return null;
  return fs.readFileSync(getVaultFile());
}

function hasAccount() {
  return fs.existsSync(getVaultFile());
}

module.exports = { save, load, hasAccount };
