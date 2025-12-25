const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const VAULT_FILE = () => path.join(app.getPath("userData"), "vault.bin");

function save(blob) {
  fs.writeFileSync(VAULT_FILE(), blob);
}

function load() {
  if (!fs.existsSync(VAULT_FILE())) return null;
  return fs.readFileSync(VAULT_FILE());
}

module.exports = { save, load };
