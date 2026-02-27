const test = require("node:test");
const assert = require("node:assert/strict");
const {
  deriveKey,
  encryptWithPassword,
  decryptWithPassword,
  encryptWithKey,
} = require("../src/vault/crypto.js");

test("encryptWithPassword stores KDF metadata and decrypts", async () => {
  const payload = await encryptWithPassword("hello-world", "master-pass-123");
  assert.equal(payload.kdf, "argon2id");
  assert.equal(typeof payload.kdfParams, "object");
  assert.ok(payload.kdfParams.memoryCost >= 16384);

  const plaintext = await decryptWithPassword(payload, "master-pass-123");
  assert.equal(plaintext, "hello-world");
});

test("decryptWithPassword supports legacy payloads without kdf metadata", async () => {
  const salt = Buffer.from("00112233445566778899aabbccddeeff", "hex");
  const legacyKdf = { name: "scrypt", N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
  const key = await deriveKey("legacy-pass", salt, legacyKdf);

  const payload = encryptWithKey("legacy-data", key, salt, legacyKdf);
  delete payload.kdf;
  delete payload.kdfParams;
  payload.v = 1;

  const plaintext = await decryptWithPassword(payload, "legacy-pass");
  assert.equal(plaintext, "legacy-data");
});
