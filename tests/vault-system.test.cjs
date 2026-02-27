const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const servicePath = path.resolve(rootDir, "src/vault/vaultService.js");
const storagePath = path.resolve(rootDir, "src/vault/storage.js");
const storePath = path.resolve(rootDir, "src/vault/vaultStore.js");
const cryptoPath = path.resolve(rootDir, "src/vault/crypto.js");

function withVaultService(mocks) {
  const previous = new Map();

  for (const [modulePath, exports] of Object.entries(mocks)) {
    previous.set(modulePath, require.cache[modulePath]);
    require.cache[modulePath] = {
      id: modulePath,
      filename: modulePath,
      loaded: true,
      exports,
    };
  }

  delete require.cache[servicePath];
  const service = require(servicePath);

  return {
    service,
    restore() {
      delete require.cache[servicePath];
      for (const [modulePath, original] of previous.entries()) {
        if (original) {
          require.cache[modulePath] = original;
        } else {
          delete require.cache[modulePath];
        }
      }
    },
  };
}

function createInMemoryStore() {
  return {
    payload: null,
    vault: null,
  };
}

test("vaultService lifecycle: save -> lock -> unlock -> item CRUD", async () => {
  const state = createInMemoryStore();
  const cryptoModule = require(cryptoPath);

  const mockStorage = {
    save(data) {
      state.payload = structuredClone(data);
    },
    load() {
      return state.payload;
    },
    hasAccount() {
      return !!state.payload;
    },
  };

  const mockVaultStore = {
    setVault(vault) {
      state.vault = structuredClone(vault);
    },
    getVault() {
      return state.vault;
    },
    subscribe() {
      return () => {};
    },
  };

  const harness = withVaultService({
    [storagePath]: mockStorage,
    [storePath]: mockVaultStore,
    [cryptoPath]: cryptoModule,
  });

  const { service } = harness;

  try {
    const initialVault = {
      version: 1,
      meta: { username: "thu" },
      categories: [{ id: "all", name: "All", system: true }],
      items: [],
    };

    await service.saveVault("pass12345", initialVault);
    assert.equal(service.isUnlocked(), true);
    assert.ok(state.payload && typeof state.payload === "object");

    const added = service.addItem({
      site: "github",
      username: "thu",
      password: "secret",
      categoryId: "all",
    });
    assert.equal(added.site, "github");
    assert.equal(state.vault.items.length, 1);

    const updated = service.updateItem(added.id, { site: "github.com" });
    assert.equal(updated.site, "github.com");

    const deleted = service.deleteItem(added.id);
    assert.deepEqual(deleted, { ok: true });
    assert.equal(state.vault.items.length, 0);

    service.lockVault();
    assert.equal(service.isUnlocked(), false);
    assert.throws(() => service.addItem({ site: "x" }), /VAULT_LOCKED/);

    await service.unlockVault("pass12345");
    assert.equal(service.isUnlocked(), true);
    assert.equal(state.vault.meta.username, "thu");
  } finally {
    harness.restore();
  }
});

test("vaultService export/import works with encrypted files", async () => {
  const state = createInMemoryStore();
  const cryptoModule = require(cryptoPath);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "thinn-vault-test-"));
  const exportPath = path.join(tempDir, "vault-export.json");

  const mockStorage = {
    save(data) {
      state.payload = structuredClone(data);
    },
    load() {
      return state.payload;
    },
    hasAccount() {
      return !!state.payload;
    },
  };

  const mockVaultStore = {
    setVault(vault) {
      state.vault = structuredClone(vault);
    },
    getVault() {
      return state.vault;
    },
    subscribe() {
      return () => {};
    },
  };

  const harness = withVaultService({
    [storagePath]: mockStorage,
    [storePath]: mockVaultStore,
    [cryptoPath]: cryptoModule,
  });

  const { service } = harness;

  try {
    const initialVault = {
      version: 1,
      meta: { username: "thu" },
      categories: [{ id: "all", name: "All", system: true }],
      items: [{ id: "1", site: "mail", password: "pw" }],
    };

    await service.saveVault("master-pass", initialVault);
    await service.exportVaultToFile(exportPath, "export-pass");

    const exportedPayload = JSON.parse(fs.readFileSync(exportPath, "utf8"));
    const exportedJson = await cryptoModule.decryptWithPassword(exportedPayload, "export-pass");
    assert.ok(exportedJson);
    const exportedVault = JSON.parse(exportedJson);
    assert.equal(exportedVault.items.length, 1);

    service.lockVault();
    const result = await service.importVaultFromFile(exportPath, "export-pass");
    assert.deepEqual(result, { ok: true });
    assert.equal(service.isUnlocked(), true);
    assert.equal(state.vault.items[0].site, "mail");
  } finally {
    harness.restore();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("vaultService import returns INVALID_PASSWORD for wrong import password", async () => {
  const state = createInMemoryStore();
  const cryptoModule = require(cryptoPath);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "thinn-vault-test-"));
  const exportPath = path.join(tempDir, "vault-export.json");

  const mockStorage = {
    save(data) {
      state.payload = structuredClone(data);
    },
    load() {
      return state.payload;
    },
    hasAccount() {
      return !!state.payload;
    },
  };

  const mockVaultStore = {
    setVault(vault) {
      state.vault = structuredClone(vault);
    },
    getVault() {
      return state.vault;
    },
    subscribe() {
      return () => {};
    },
  };

  const harness = withVaultService({
    [storagePath]: mockStorage,
    [storePath]: mockVaultStore,
    [cryptoPath]: cryptoModule,
  });

  const { service } = harness;

  try {
    const initialVault = {
      version: 1,
      meta: { username: "thu" },
      categories: [{ id: "all", name: "All", system: true }],
      items: [{ id: "1", site: "mail", password: "pw" }],
    };

    await service.saveVault("master-pass", initialVault);
    await service.exportVaultToFile(exportPath, "correct-import-pass");
    service.lockVault();

    await assert.rejects(
      () => service.importVaultFromFile(exportPath, "wrong-pass"),
      /INVALID_PASSWORD/
    );
  } finally {
    harness.restore();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("vaultService import rejects invalid vault file format", async () => {
  const state = createInMemoryStore();
  const cryptoModule = require(cryptoPath);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "thinn-vault-test-"));
  const badJsonPath = path.join(tempDir, "bad-json.json");
  const badShapePath = path.join(tempDir, "bad-shape.json");

  fs.writeFileSync(badJsonPath, "{this-is-not-json}");
  fs.writeFileSync(
    badShapePath,
    JSON.stringify({
      salt: "abc",
      iv: "abc",
      // Missing tag/content should fail payload shape validation.
    })
  );

  const mockStorage = {
    save(data) {
      state.payload = structuredClone(data);
    },
    load() {
      return state.payload;
    },
    hasAccount() {
      return !!state.payload;
    },
  };

  const mockVaultStore = {
    setVault(vault) {
      state.vault = structuredClone(vault);
    },
    getVault() {
      return state.vault;
    },
    subscribe() {
      return () => {};
    },
  };

  const harness = withVaultService({
    [storagePath]: mockStorage,
    [storePath]: mockVaultStore,
    [cryptoPath]: cryptoModule,
  });

  const { service } = harness;

  try {
    await assert.rejects(
      () => service.importVaultFromFile(badJsonPath, "any-pass"),
      /INVALID_VAULT_FILE/
    );

    await assert.rejects(
      () => service.importVaultFromFile(badShapePath, "any-pass"),
      /INVALID_VAULT_FILE/
    );
  } finally {
    harness.restore();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("vaultService applies createdAt/updatedAt timestamps correctly", async () => {
  const state = createInMemoryStore();
  const cryptoModule = require(cryptoPath);
  const originalNow = Date.now;
  let nowValues = [1000, 2000];

  Date.now = () => nowValues.shift() ?? 2000;

  const mockStorage = {
    save(data) {
      state.payload = structuredClone(data);
    },
    load() {
      return state.payload;
    },
    hasAccount() {
      return !!state.payload;
    },
  };

  const mockVaultStore = {
    setVault(vault) {
      state.vault = structuredClone(vault);
    },
    getVault() {
      return state.vault;
    },
    subscribe() {
      return () => {};
    },
  };

  const harness = withVaultService({
    [storagePath]: mockStorage,
    [storePath]: mockVaultStore,
    [cryptoPath]: cryptoModule,
  });

  const { service } = harness;

  try {
    const initialVault = {
      version: 1,
      meta: { username: "thu" },
      categories: [{ id: "all", name: "All", system: true }],
      items: [],
    };

    await service.saveVault("master-pass", initialVault);
    const item = service.addItem({ site: "github" });
    assert.equal(item.createdAt, 1000);
    assert.equal(item.updatedAt, 1000);

    const updated = service.updateItem(item.id, { site: "github.com" });
    assert.equal(updated.updatedAt, 2000);
  } finally {
    Date.now = originalNow;
    harness.restore();
  }
});
