const fs = require("fs");
const { dialog } = require("electron");
const storage = require("./storage");
const vaultService = require("./vaultService");

async function exportVault() {
  // 🔐 1. Vault must be unlocked
  if (!vaultService.isUnlocked()) {
    throw new Error("Vault is locked");
  }

  // 📂 2. Ask user where to save
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Export Vault",
    defaultPath: "thinn-vault-backup.json",
    filters: [{ name: "Vault Backup", extensions: ["json"] }],
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  // 📦 3. Get encrypted vault (already encrypted)
  const encryptedPayload = storage.load();
  if (!encryptedPayload || typeof encryptedPayload !== "object") {
    throw new Error("Vault data not found");
  }

  // 🛡 4. Atomic write (safe)
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(encryptedPayload), "utf8");
  fs.renameSync(tmpPath, filePath);

  return { success: true };
}

module.exports = { exportVault };
