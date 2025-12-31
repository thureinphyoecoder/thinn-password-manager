/* =========================
   CREATE SCREEN (INIT)
========================= */

export function initCreateScreen() {
  console.log("[UI] initCreateScreen");

  const createUsername = document.getElementById("create-username");
  const createPw = document.getElementById("create-pw");
  const confirmPw = document.getElementById("confirm-pw");
  const createBtn = document.getElementById("create-btn");
  const createMsg = document.getElementById("create-msg");
  const ackCheckbox = document.getElementById("ack-no-recovery");

  if (!createPw || !createBtn) return;

  /* =========================
     PASSWORD STRENGTH
  ========================= */
  function getPasswordStrength(password) {
    const len = password.length;
    if (len === 0) return null;
    if (len < 8) return "weak";
    if (len < 12) return "medium";
    return "strong";
  }

  function validate() {
    const strength = getPasswordStrength(createPw.value);

    createBtn.disabled = !(
      ackCheckbox.checked &&
      (strength === "medium" || strength === "strong") &&
      createPw.value === confirmPw.value &&
      createUsername.value.trim()
    );
  }

  /* =========================
     EVENTS
  ========================= */

  createPw.addEventListener("input", validate);
  confirmPw.addEventListener("input", validate);
  ackCheckbox.addEventListener("change", validate);
  createUsername.addEventListener("input", validate);

  createBtn.onclick = async () => {
    createMsg.textContent = "";

    const username = createUsername.value.trim();
    const pw = createPw.value;

    try {
      await window.vault.save(pw, {
        meta: {
          username,
          createdAt: Date.now(),
        },
        items: [],
      });

      // ❌ DO NOT showScreen here
      // main process will emit LOCKED → app.js → setState()
    } catch (err) {
      createMsg.textContent = err?.message || "Failed to create account";
    }
  };
}
