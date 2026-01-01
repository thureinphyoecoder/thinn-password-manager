// src/renderer/events/unlock.js

let bound = false;

export function initUnlockScreen() {
  console.log("[UI] initUnlockScreen");

  const unlockPw = document.getElementById("unlock-pw");
  const unlockBtn = document.getElementById("unlock-btn");
  const unlockMsg = document.getElementById("unlock-msg");

  if (!unlockPw || !unlockBtn || !unlockMsg) return;

  // RESET ON SCREEN ENTRY
  unlockPw.value = "";
  unlockMsg.textContent = "";
  unlockMsg.classList.remove("show");
  unlockPw.classList.remove("error", "shake");

  requestAnimationFrame(() => unlockPw.focus());

  async function handleUnlock() {
    const password = unlockPw.value;
    if (!password) return;

    // clear old error
    unlockMsg.classList.remove("show");
    unlockPw.classList.remove("error", "shake");

    let res;
    try {
      res = await window.vault.load(password);
    } catch {
      res = null;
    }

    if (!res || res.ok !== true) {
      unlockMsg.textContent = "Wrong password";
      unlockMsg.classList.add("show");

      unlockPw.classList.add("error", "shake");
      unlockPw.focus();

      setTimeout(() => unlockPw.classList.remove("shake"), 300);
      return;
    }

    // SUCCESS → main process handles state
    unlockPw.value = "";
  }

  if (!bound) {
    unlockBtn.addEventListener("click", handleUnlock);

    unlockPw.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleUnlock();
    });

    unlockPw.addEventListener("input", () => {
      unlockMsg.classList.remove("show");
      unlockPw.classList.remove("error");
    });

    bound = true;
  }
}
