let unlocked = false;
let lastActivityAt = Date.now();

const AUTO_LOCK_AFTER = 1 * 60 * 1000;

let timer = null;

function startAutoLockTimer(lockFn) {
  if (timer) clearInterval(timer);

  timer = setInterval(() => {
    if (!unlocked) return;

    const now = Date.now();
    if (now - lastActivityAt >= AUTO_LOCK_AFTER) {
      lockFn();
    }
  }, 1000);
}

function markActivity() {
  if (!unlocked) return;
  lastActivityAt = Date.now();
}

function unlockVault() {
  unlocked = true;
  lastActivityAt = Date.now();
}

function lockVault() {
  unlocked = false;
  lastActivityAt = 0;
}

function isUnlocked() {
  return unlocked;
}

module.exports = {
  startAutoLockTimer,
  markActivity,
  unlockVault,
  lockVault,
  isUnlocked,
};
