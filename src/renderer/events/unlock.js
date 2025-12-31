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

  // ✅ unlock အောင်မြင်ရင်
  // ❌ showScreen မခေါ်
  // app.js က onUnlocked() နဲ့ handle လုပ်မယ်
  unlockPw.value = "";
}

/* =========================
   ACTIVITY TRACKING
========================= */
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

  ["mousemove", "keydown", "mousedown", "scroll", "touchstart"].forEach((e) =>
    window.addEventListener(e, markActivity)
  );
}
