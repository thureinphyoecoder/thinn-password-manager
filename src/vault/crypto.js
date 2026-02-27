const crypto = require("crypto");
const { promisify } = require("util");
const argon2 = require("argon2");

const scrypt = promisify(crypto.scrypt);

const ALGO = "aes-256-gcm";
const KEY_LEN = 32;
const IV_LEN = 12;
const SALT_LEN = 16;
const DEFAULT_KDF = Object.freeze({
  name: "argon2id",
  memoryCost: 65536, // KiB
  timeCost: 3,
  parallelism: 1,
});
const DEFAULT_ARGON2_HASH_LENGTH = KEY_LEN;
const LEGACY_KDF = Object.freeze({
  name: "scrypt",
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
});

function normalizeKdfConfig(input = DEFAULT_KDF) {
  if (!input || typeof input !== "object") return { ...DEFAULT_KDF };

  if (input.name === "argon2id") {
    const memoryCost = Number(input.memoryCost) || DEFAULT_KDF.memoryCost;
    const timeCost = Number(input.timeCost) || DEFAULT_KDF.timeCost;
    const parallelism = Number(input.parallelism) || DEFAULT_KDF.parallelism;
    return {
      name: "argon2id",
      memoryCost: Math.max(16384, memoryCost),
      timeCost: Math.max(2, timeCost),
      parallelism: Math.max(1, parallelism),
    };
  }

  const N = Number(input.N) || LEGACY_KDF.N;
  const r = Number(input.r) || LEGACY_KDF.r;
  const p = Number(input.p) || LEGACY_KDF.p;
  const maxmem = Number(input.maxmem) || LEGACY_KDF.maxmem;

  return {
    name: "scrypt",
    N: Math.max(16384, N),
    r: Math.max(1, r),
    p: Math.max(1, p),
    maxmem: Math.max(32 * 1024 * 1024, maxmem),
  };
}

function getKdfConfigFromPayload(payload) {
  if (
    payload &&
    payload.kdf === "argon2id" &&
    payload.kdfParams &&
    typeof payload.kdfParams === "object"
  ) {
    return normalizeKdfConfig({ name: "argon2id", ...payload.kdfParams });
  }

  if (
    payload &&
    payload.kdf === "scrypt" &&
    payload.kdfParams &&
    typeof payload.kdfParams === "object"
  ) {
    return normalizeKdfConfig({ name: "scrypt", ...payload.kdfParams });
  }

  return { ...LEGACY_KDF };
}

async function deriveKey(password, salt, kdfConfig = DEFAULT_KDF) {
  const config = normalizeKdfConfig(kdfConfig);

  if (config.name === "argon2id") {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      salt,
      hashLength: DEFAULT_ARGON2_HASH_LENGTH,
      raw: true,
      memoryCost: config.memoryCost,
      timeCost: config.timeCost,
      parallelism: config.parallelism,
    });
    return Buffer.from(hash);
  }

  return await scrypt(password, salt, KEY_LEN, {
    N: config.N,
    r: config.r,
    p: config.p,
    maxmem: config.maxmem,
  });
}

async function encryptWithPassword(plaintext, password) {
  const salt = crypto.randomBytes(SALT_LEN);
  const kdf = { ...DEFAULT_KDF };
  const key = await deriveKey(password, salt, kdf);
  const iv = crypto.randomBytes(IV_LEN);

  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const content = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

  return {
    v: 2,
    algo: ALGO,
    kdf: kdf.name,
    kdfParams:
      kdf.name === "argon2id"
        ? {
            memoryCost: kdf.memoryCost,
            timeCost: kdf.timeCost,
            parallelism: kdf.parallelism,
          }
        : {
            N: kdf.N,
            r: kdf.r,
            p: kdf.p,
            maxmem: kdf.maxmem,
          },
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    tag: cipher.getAuthTag().toString("hex"),
    content: content.toString("hex"),
  };
}

async function decryptWithPassword(payload, password) {
  const salt = Buffer.from(payload.salt, "hex");
  const key = await deriveKey(password, salt, getKdfConfigFromPayload(payload));
  return decryptWithKey(payload, key);
}

function encryptWithKey(plaintext, key, salt, kdfConfig = DEFAULT_KDF) {
  const kdf = normalizeKdfConfig(kdfConfig);
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);

  const content = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

  return {
    v: 2,
    algo: ALGO,
    kdf: kdf.name,
    kdfParams:
      kdf.name === "argon2id"
        ? {
            memoryCost: kdf.memoryCost,
            timeCost: kdf.timeCost,
            parallelism: kdf.parallelism,
          }
        : {
            N: kdf.N,
            r: kdf.r,
            p: kdf.p,
            maxmem: kdf.maxmem,
          },
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
  return crypto.scryptSync(password, salt, KEY_LEN, {
    N: LEGACY_KDF.N,
    r: LEGACY_KDF.r,
    p: LEGACY_KDF.p,
    maxmem: LEGACY_KDF.maxmem,
  });
}

function encrypt(plaintext, password) {
  const salt = crypto.randomBytes(SALT_LEN);
  const key = deriveKeySync(password, salt);
  return encryptWithKey(plaintext, key, salt, LEGACY_KDF);
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
  getKdfConfigFromPayload,
  normalizeKdfConfig,
  encrypt,
  decrypt,
  decryptVault,
};
