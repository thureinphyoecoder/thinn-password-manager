const { load } = require("./storage");
const { decrypt } = require("./crypto");

function verifyMasterPassword(password) {
  const encrypted = load();
  if (!encrypted || typeof encrypted !== "object") return false;

  try {
    return !!decrypt(encrypted, password);
  } catch {
    return false;
  }
}

module.exports = { verifyMasterPassword };
