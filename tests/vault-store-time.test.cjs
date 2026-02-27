const test = require("node:test");
const assert = require("node:assert/strict");
const vaultStore = require("../src/vault/vaultStore.js");

test("vaultStore sets createdAt and updatedAt when missing", () => {
  const originalNow = Date.now;
  Date.now = () => 1111;

  try {
    vaultStore.setVault({
      version: 1,
      meta: { username: "thu" },
      categories: [{ id: "all", name: "All", system: true }],
      items: [],
    });

    const vault = vaultStore.getVault();
    assert.equal(vault.meta.createdAt, 1111);
    assert.equal(vault.meta.updatedAt, 1111);
  } finally {
    Date.now = originalNow;
  }
});

test("vaultStore refreshes updatedAt while preserving existing createdAt", () => {
  const originalNow = Date.now;
  Date.now = () => 2222;

  try {
    vaultStore.setVault({
      version: 1,
      meta: { username: "thu", createdAt: 1234, updatedAt: 1500 },
      categories: [{ id: "all", name: "All", system: true }],
      items: [],
    });

    const vault = vaultStore.getVault();
    assert.equal(vault.meta.createdAt, 1234);
    assert.equal(vault.meta.updatedAt, 2222);
  } finally {
    Date.now = originalNow;
  }
});
