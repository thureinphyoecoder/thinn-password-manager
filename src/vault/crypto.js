const crypto = require("crypto");

const ALGO = "aes-256-gcm";
const SALT_LEN = 16;
const IV_LEN = 12;
const KEY_LEN = 32;

function deriveKey(password, salt) {
  return crypto.scryptSync(password, salt, KEY_LEN);
}

function encrypt(password, data) {
  const salt = crypto.randomBytes(SALT_LEN);
  const iv = crypto.randomBytes(IV_LEN);
  const key = deriveKey(password, salt);

  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, encrypted]);
}

function decrypt(password, blob) {
  const salt = blob.slice(0, SALT_LEN);
  const iv = blob.slice(SALT_LEN, SALT_LEN + IV_LEN);
  const tag = blob.slice(SALT_LEN + IV_LEN, SALT_LEN + IV_LEN + 16);
  const data = blob.slice(SALT_LEN + IV_LEN + 16);

  const key = deriveKey(password, salt);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);

  return JSON.parse(decrypted.toString("utf8"));
}

module.exports = { encrypt, decrypt, deriveKey };
