let autoLockMs = 60_000; // default 60s
let timer = null;
let unlocked = false;
let onLock = null;

function resetTimer() {
  if (timer) clearTimeout(timer);

  if (!unlocked) return;
  if (autoLockMs === 0) return; // never

  timer = setTimeout(() => {
    lockVault();
  }, autoLockMs);
}

function setAutoLock(ms) {
  autoLockMs = ms;
  resetTimer();
}

function markActivity() {
  if (!unlocked) return;
  resetTimer();
}

function unlockVault() {
  unlocked = true;
  resetTimer();
}

function lockVault() {
  if (!unlocked) return;

  unlocked = false;
  if (timer) clearTimeout(timer);
  timer = null;

  onLock?.();
}

function startAutoLockTimer(cb) {
  onLock = cb;
}

module.exports = {
  setAutoLock,
  markActivity,
  unlockVault,
  lockVault,
  startAutoLockTimer,
};
