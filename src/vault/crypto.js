const crypto = require("crypto");
const { promisify } = require("util");

const scrypt = promisify(crypto.scrypt);

const ALGO = "aes-256-gcm";
const KEY_LEN = 32;
const IV_LEN = 12;
const SALT_LEN = 16;

async function deriveKey(password, salt) {
  return await scrypt(password, salt, KEY_LEN, { N: 16384 }); // N value က စက်ရဲ့ အလုပ်လုပ်နှုန်းကို သတ်မှတ်တာ
}

async function encryptWithPassword(plaintext, password) {
  const salt = crypto.randomBytes(SALT_LEN);
  const key = await deriveKey(password, salt);
  const iv = crypto.randomBytes(IV_LEN);

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

async function decryptWithPassword(payload, password) {
  const salt = Buffer.from(payload.salt, "hex");
  const key = await deriveKey(password, salt);
  return decryptWithKey(payload, key);
}

function encryptWithKey(plaintext, key, salt) {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);

  const content = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

  return {
    v: 1,
    algo: ALGO,
    salt: salt instanceof Buffer ? salt.toString("hex") : salt,
    iv: iv.toString("hex"),
    tag: cipher.getAuthTag().toString("hex"),
    content: content.toString("hex"),
  };
}

function decryptWithKey(payload, key) {
  try {
    const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(payload.iv, "hex"));
    decipher.setAuthTag(Buffer.from(payload.tag, "hex"));

    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(payload.content, "hex")),
      decipher.final(),
    ]);

    return plaintext.toString("utf8");
  } catch (e) {
    return null; // Decrypt မအောင်မြင်ရင် null ပြန်မယ်
  }
}

function deriveKeySync(password, salt) {
  return crypto.scryptSync(password, salt, KEY_LEN, { N: 16384 });
}

function encrypt(plaintext, password) {
  const salt = crypto.randomBytes(SALT_LEN);
  const key = deriveKeySync(password, salt);
  return encryptWithKey(plaintext, key, salt);
}

function decrypt(payload, password) {
  const key = deriveKeySync(password, Buffer.from(payload.salt, "hex"));
  return decryptWithKey(payload, key);
}

function decryptVault(payload, password) {
  return decrypt(payload, password);
}

module.exports = {
  deriveKey,
  encryptWithPassword,
  decryptWithPassword,
  encryptWithKey,
  decryptWithKey,
  encrypt,
  decrypt,
  decryptVault,
};
