import { showScreen } from "../ui.js";

/* =========================
   DOM REFERENCES (CREATE)
========================= */
const createUsername = document.getElementById("create-username");
const createPw = document.getElementById("create-pw");
const confirmPw = document.getElementById("confirm-pw");
const createBtn = document.getElementById("create-btn");
const createMsg = document.getElementById("create-msg");
const ackCheckbox = document.getElementById("ack-no-recovery");

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

/* =========================
   CREATE ACCOUNT
========================= */
async function handleCreateAccount() {
  const username = createUsername.value.trim();
  const pw = createPw.value;
  const confirm = confirmPw.value;

  // reset
  createMsg.textContent = "";
  createPw.classList.remove("error");
  confirmPw.classList.remove("error");

  if (!username || !pw || !confirm) {
    createMsg.textContent = "All fields are required";
    return;
  }

  if (pw !== confirm) {
    createMsg.textContent = "Passwords do not match";
    createPw.classList.add("error");
    confirmPw.classList.add("error");
    confirmPw.focus();
    return;
  }

  if (pw.length < 8) {
    createMsg.textContent = "Password must be at least 8 characters";
    createPw.classList.add("error");
    createPw.focus();
    return;
  }

  if (!ackCheckbox.checked) {
    createMsg.textContent = "Please confirm password recovery notice";
    return;
  }

  const initialVault = {
    meta: {
      username,
      createdAt: Date.now(),
    },
    items: [],
  };

  await window.vault.save(pw, initialVault);

  // cleanup
  createUsername.value = "";
  createPw.value = "";
  confirmPw.value = "";
  ackCheckbox.checked = false;
  createBtn.disabled = true;

  showScreen("home");
}

/* =========================
   UI EVENTS
========================= */
function bindPasswordStrength() {
  const barWrapper = document.querySelector(".password-strength");
  const bar = document.getElementById("password-strength-bar");

  if (!createPw || !barWrapper || !bar) return;

  createPw.addEventListener("input", () => {
    const strength = getPasswordStrength(createPw.value);

    bar.classList.remove("weak", "medium", "strong");
    createBtn.disabled = true;

    if (!strength) {
      barWrapper.classList.remove("visible");
      return;
    }

    barWrapper.classList.add("visible");
    bar.classList.add(strength);

    if (
      ackCheckbox.checked &&
      (strength === "medium" || strength === "strong")
    ) {
      createBtn.disabled = false;
    }
  });
}

function bindAckCheckbox() {
  ackCheckbox?.addEventListener("change", () => {
    const strength = getPasswordStrength(createPw.value);

    if (
      ackCheckbox.checked &&
      (strength === "medium" || strength === "strong")
    ) {
      createBtn.disabled = false;
    } else {
      createBtn.disabled = true;
    }
  });
}

/* =========================
   BIND
========================= */
export function bindCreateEvents() {
  createBtn?.addEventListener("click", handleCreateAccount);
  bindPasswordStrength();
  bindAckCheckbox();
}
