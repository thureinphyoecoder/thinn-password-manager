const { load } = require("./storage");
const { decryptVault } = require("./crypto"); // already exists in your project

function verifyMasterPassword(password) {
  const encrypted = load();
  if (!encrypted) return false;

  try {
    decryptVault(encrypted, password);
    return true;
  } catch {
    return false;
  }
}

module.exports = { verifyMasterPassword };
