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

function save(encryptedObject) {
  const file = getVaultFile();
  const tmp = file + ".tmp";

  if (Buffer.isBuffer(encryptedObject)) {
    fs.writeFileSync(tmp, encryptedObject);
    fs.renameSync(tmp, file);
    return;
  }

  const payload =
    typeof encryptedObject === "string" ? encryptedObject : JSON.stringify(encryptedObject);
  fs.writeFileSync(tmp, payload, "utf8");
  fs.renameSync(tmp, file);
}

function load() {
  const file = getVaultFile();
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function hasAccount() {
  return fs.existsSync(getVaultFile());
}

module.exports = { save, load, hasAccount };
