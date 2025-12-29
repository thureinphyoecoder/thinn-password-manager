import { showScreen } from "../ui.js";

/* =========================
   DOM REFERENCES (UNLOCK)
========================= */
const unlockPw = document.getElementById("unlock-pw");
const unlockBtn = document.getElementById("unlock-btn");
const unlockMsg = document.getElementById("unlock-msg");

/* =========================
   UNLOCK
========================= */
async function handleUnlock() {
  if (!unlockPw.value) return;

  unlockMsg.hidden = true;
  unlockPw.classList.remove("error", "shake");

  const password = unlockPw.value;

  try {
    const res = await window.vault.load(password);

    if (!res?.ok) {
      unlockMsg.textContent = "Wrong password";
      unlockMsg.hidden = false;

      unlockPw.classList.add("error", "shake");
      unlockPw.value = "";
      unlockPw.focus();

      setTimeout(() => {
        unlockPw.classList.remove("shake");
      }, 300);

      return;
    }

    unlockPw.value = "";
    showScreen("home");
  } catch {
    unlockMsg.textContent = "Unlock failed";
    unlockMsg.hidden = false;
  }
}

/* =========================
   AUTO LOCK + ACTIVITY
========================= */
function focusUnlock() {
  requestAnimationFrame(() => {
    unlockPw?.focus();
  });
}

function handleAutoLock() {
  showScreen("unlock");
  focusUnlock();
}

function markActivity() {
  window.vault.activity();
}

/* =========================
   BIND
========================= */
export function bindUnlockEvents() {
  unlockBtn?.addEventListener("click", handleUnlock);

  unlockPw?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleUnlock();
  });

  window.addEventListener("vault-locked", handleAutoLock);

  ["mousemove", "keydown", "mousedown", "scroll", "touchstart"].forEach((e) =>
    window.addEventListener(e, markActivity)
  );
}
