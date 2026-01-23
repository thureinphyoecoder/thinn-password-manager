const crypto = require("crypto");

const ALGO = "aes-256-gcm";
const KEY_LEN = 32;
const IV_LEN = 12;
const SALT_LEN = 16;

function deriveKey(password, salt) {
  return crypto.scryptSync(password, salt, KEY_LEN);
}

function encrypt(plaintext, password) {
  const salt = crypto.randomBytes(SALT_LEN);
  const iv = crypto.randomBytes(IV_LEN);
  const key = deriveKey(password, salt);

  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const content = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

  return {
    v: 1,
    algo: ALGO,
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    tag: cipher.getAuthTag().toString("hex"),
    content: content.toString("hex"),
  };
}

function decrypt(blob, password) {
  const salt = Buffer.from(blob.salt, "hex");
  const iv = Buffer.from(blob.iv, "hex");
  const tag = Buffer.from(blob.tag, "hex");
  const key = deriveKey(password, salt);

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const buf = Buffer.concat([decipher.update(Buffer.from(blob.content, "hex")), decipher.final()]);

  return buf.toString("utf8");
}

module.exports = { encrypt, decrypt };
