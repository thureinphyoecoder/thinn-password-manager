const fs = require("fs");
const path = require("path");
const { dialog } = require("electron");
const storage = require("./storage");
const { isVaultUnlocked } = require("./vaultLock");

/**
 * Very light validation:
 * - must be Buffer
 * - non-empty
 * - optional magic/header check if you have one
 */
function validateEncryptedBlob(buf) {
  if (!Buffer.isBuffer(buf)) return false;
  if (buf.length < 16) return false; // too small to be real encrypted data
  return true;
}

async function importVault() {
  // 🔐 1) Vault must be unlocked
  if (!isVaultUnlocked()) {
    throw new Error("Vault is locked");
  }

  // 📂 2) Pick file
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "Import Vault",
    properties: ["openFile"],
    filters: [
      { name: "Vault Backup", extensions: ["bin", "enc", "dat", "json"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (canceled || !filePaths || !filePaths[0]) {
    return { canceled: true };
  }

  const importPath = filePaths[0];

  // ⚠️ 3) Confirm overwrite
  const { response } = await dialog.showMessageBox({
    type: "warning",
    buttons: ["Cancel", "Import & Replace"],
    defaultId: 1,
    cancelId: 0,
    title: "Replace Current Vault?",
    message: "This will permanently replace your current vault.",
    detail: "Make sure you have backed up your existing vault before continuing.",
  });

  if (response !== 1) {
    return { canceled: true };
  }

  // 📥 4) Read file (binary)
  const incoming = fs.readFileSync(importPath);

  // 🧪 5) Validate
  if (!validateEncryptedBlob(incoming)) {
    throw new Error("Invalid vault file");
  }

  // 🛡 6) Atomic replace using storage.save
  storage.save(incoming);

  return { success: true };
}

module.exports = { importVault };
