const fs = require("fs");
const path = require("path");
const { dialog } = require("electron");
const { getEncryptedVaultBlob } = require("./storage");
const { isVaultUnlocked } = require("./vaultLock");

async function exportVault() {
  // 🔐 1. Vault must be unlocked
  if (!isVaultUnlocked()) {
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
  const encryptedPayload = getEncryptedVaultBlob();

  // 🛡 4. Atomic write (safe)
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, encryptedPayload, "utf8");
  fs.renameSync(tmpPath, filePath);

  return { success: true };
}

module.exports = { exportVault };
