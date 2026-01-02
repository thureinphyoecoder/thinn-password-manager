import { setState, AppStates } from "../state.js";

export function initUnlockScreen() {
  const unlockPw = document.getElementById("unlock-pw");
  const unlockBtn = document.getElementById("unlock-btn");
  const unlockMsg = document.getElementById("unlock-msg");

  if (!unlockPw || !unlockBtn || !unlockMsg) return;

  // ✅ RESET EVERY TIME SCREEN IS SHOWN
  unlockPw.value = "";
  unlockBtn.disabled = true;
  unlockMsg.textContent = "";
  unlockMsg.classList.remove("show");
  unlockPw.classList.remove("error", "shake");

  requestAnimationFrame(() => unlockPw.focus());

  if (!unlockPw.dataset.bound) {
    unlockBtn.addEventListener("click", handleUnlock);

    unlockPw.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleUnlock();
    });

    unlockPw.addEventListener("input", () => {
      unlockBtn.disabled = unlockPw.value.trim().length === 0;
      unlockMsg.classList.remove("show");
      unlockPw.classList.remove("error");
    });

    unlockPw.dataset.bound = "true";
  }

  async function handleUnlock() {
    const password = unlockPw.value.trim();
    if (!password) return;

    // ===== START LOADING =====
    unlockBtn.disabled = true;
    unlockBtn.classList.add("loading");
    unlockMsg.textContent = "";
    unlockMsg.classList.remove("show");

    let res;
    try {
      res = await window.vault.load(password);
    } catch {
      res = null;
    }

    // ===== WRONG PASSWORD =====
    if (!res || res.ok !== true) {
      unlockMsg.textContent = "Wrong password";
      unlockMsg.classList.add("show");

      unlockPw.classList.add("input-error", "shake");
      unlockPw.focus();

      unlockBtn.classList.remove("loading");
      unlockBtn.disabled = false;

      setTimeout(() => {
        unlockPw.classList.remove("shake");
      }, 350);

      return;
    }

    // ===== SUCCESS =====
    unlockBtn.classList.remove("loading");

    // auth card exit animation
    const card = document.querySelector(".auth-card");
    if (card) {
      card.classList.add("auth-exit");
    }

    // switch state AFTER animation
    setTimeout(() => {
      setState(AppStates.UNLOCKED);
    }, 220);
  }
}
