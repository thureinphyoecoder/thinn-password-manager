/* =========================
   UNLOCK SCREEN (INIT)
========================= */

export function initUnlockScreen() {
  console.log("[UI] initUnlockScreen");

  const unlockPw = document.getElementById("unlock-pw");
  const unlockBtn = document.getElementById("unlock-btn");
  const unlockMsg = document.getElementById("unlock-msg");

  if (!unlockPw || !unlockBtn) return;

  /* =========================
     UNLOCK
  ========================= */
  async function handleUnlock() {
    if (!unlockPw.value) return;

    unlockMsg.hidden = true;
    unlockPw.classList.remove("error", "shake");

    try {
      const res = await window.vault.load(unlockPw.value);

      if (!res?.ok) {
        throw new Error("Wrong password");
      }

      // success:
      unlockPw.value = "";
      // main process emits UNLOCKED → app.js → setState()
    } catch {
      unlockMsg.textContent = "Wrong password";
      unlockMsg.hidden = false;

      unlockPw.classList.add("error", "shake");
      unlockPw.value = "";
      unlockPw.focus();

      setTimeout(() => {
        unlockPw.classList.remove("shake");
      }, 300);
    }
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
  unlockBtn.addEventListener("click", handleUnlock);

  unlockPw.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleUnlock();
  });

  ["mousemove", "keydown", "mousedown", "scroll", "touchstart"].forEach((evt) =>
    window.addEventListener(evt, markActivity)
  );
}
