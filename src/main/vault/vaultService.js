const vaultStore = require("./vaultStore");
const vaultPersist = require("./storage");
const { encrypt, decrypt } = require("./crypto");

function unlockVault(password) {
  const blob = vaultPersist.load();
  if (!blob) return null;

  const vault = decrypt(password, blob);
  vaultStore.setVault(vault);
  return vault;
}

function saveVault(password) {
  const data = vaultStore.getVault(); // full vault object
  const encrypted = encrypt(password, data);

  vaultPersist.save(encrypted); // ✅ FIX HERE

  vaultStore.markClean();
}

module.exports = {
  unlockVault,
  saveVault,
};
