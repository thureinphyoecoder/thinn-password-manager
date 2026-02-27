const test = require("node:test");
const assert = require("node:assert/strict");
const vaultLock = require("../src/vault/vaultLock.js");

test("vaultLock triggers callback after inactivity", async () => {
  let locked = false;

  vaultLock.startAutoLockTimer(() => {
    locked = true;
  });

  vaultLock.setAutoLock(20);
  vaultLock.unlockVault();

  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(locked, true);
});

test("vaultLock does not auto-lock when set to never (0)", async () => {
  let locked = false;

  vaultLock.startAutoLockTimer(() => {
    locked = true;
  });

  vaultLock.setAutoLock(0);
  vaultLock.unlockVault();
  vaultLock.markActivity();

  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(locked, false);

  vaultLock.lockVault();
});

test("vaultLock with 2-minute setting does not lock within short interval", async () => {
  let locked = false;

  vaultLock.startAutoLockTimer(() => {
    locked = true;
  });

  // 2 minutes in app settings
  vaultLock.setAutoLock(120000);
  vaultLock.unlockVault();
  vaultLock.markActivity();

  // Short wait should never trigger 2-minute lock
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(locked, false);

  vaultLock.lockVault();
});

test("vaultLock schedules and resets timer correctly for 2-minute setting", () => {
  const originalSetTimeout = global.setTimeout;
  const originalClearTimeout = global.clearTimeout;
  const scheduled = [];
  const cleared = [];
  let nextId = 0;
  let locked = false;

  global.setTimeout = (fn, ms) => {
    const handle = { id: ++nextId, fn, ms };
    scheduled.push(handle);
    return handle;
  };

  global.clearTimeout = (handle) => {
    if (handle && typeof handle.id === "number") {
      cleared.push(handle.id);
    }
  };

  try {
    vaultLock.startAutoLockTimer(() => {
      locked = true;
    });

    vaultLock.setAutoLock(120000);
    vaultLock.unlockVault();
    assert.equal(scheduled.at(-1).ms, 120000);

    const firstTimerId = scheduled.at(-1).id;
    vaultLock.markActivity();
    assert.ok(cleared.includes(firstTimerId));
    assert.equal(scheduled.at(-1).ms, 120000);

    scheduled.at(-1).fn();
    assert.equal(locked, true);
  } finally {
    vaultLock.lockVault();
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
  }
});
