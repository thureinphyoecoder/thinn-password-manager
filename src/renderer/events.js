import { showScreen } from "./ui.js";

/* =====================================================
   DOM REFERENCES
===================================================== */
// CREATE
const createUsername = document.getElementById("create-username");
const createPw = document.getElementById("create-pw");
const confirmPw = document.getElementById("confirm-pw");
const createBtn = document.getElementById("create-btn");
const createMsg = document.getElementById("create-msg");
const ackCheckbox = document.getElementById("ack-no-recovery");

// UNLOCK
const unlockPw = document.getElementById("unlock-pw");
const unlockBtn = document.getElementById("unlock-btn");
const unlockMsg = document.getElementById("unlock-msg");

// HOME
const lockBtn = document.getElementById("lock-btn");
const saveBtn = document.getElementById("save-btn");
const loadBtn = document.getElementById("load-btn");
const out = document.getElementById("out");

/* =====================================================
   ACK CHECKBOX (CREATE)
===================================================== */
ackCheckbox.addEventListener("change", () => {
  const strength = getPasswordStrength(createPw.value);

  if (ackCheckbox.checked && (strength === "medium" || strength === "strong")) {
    createBtn.disabled = false;
  } else {
    createBtn.disabled = true;
  }
});

/* =====================================================
   CREATE ACCOUNT
===================================================== */
async function handleCreateAccount() {
  const username = createUsername.value.trim();
  const pw = createPw.value;
  const confirm = confirmPw.value;

  // reset state
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

/* =====================================================
   PASSWORD VISIBILITY TOGGLE
===================================================== */
document.querySelectorAll(".eye-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;

    const visible = input.type === "password";
    input.type = visible ? "text" : "password";

    btn.classList.toggle("visible", visible);

    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  });
});

/* =====================================================
   PASSWORD Strength TOGGLE
===================================================== */
if (createPw) {
  createPw.addEventListener("input", () => {
    const barWrapper = document.querySelector(".password-strength");
    const bar = document.getElementById("password-strength-bar");
    if (!barWrapper || !bar) return;

    const strength = getPasswordStrength(createPw.value);

    // reset states
    bar.classList.remove("weak", "medium", "strong");

    createBtn.disabled = true;

    if (strength === "medium" || strength === "strong") {
      if (ackCheckbox.checked) {
        createBtn.disabled = false;
      }
    }

    if (!strength) {
      barWrapper.classList.remove("visible");
      return;
    }

    // show bar
    barWrapper.classList.add("visible");
    bar.classList.add(strength);
  });
}

function getPasswordStrength(password) {
  const len = password.length;
  if (len === 0) return null;
  if (len < 8) return "weak";
  if (len < 12) return "medium";
  return "strong";
}

/* =====================================================
   UNLOCK
===================================================== */
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

    out.textContent = JSON.stringify(res.data, null, 2);
    unlockPw.value = "";

    showScreen("home");
  } catch {
    unlockMsg.textContent = "Unlock failed";
    unlockMsg.hidden = false;
  }
}

/* =====================================================
   HOME (TEMP SAMPLE)
===================================================== */
const sampleItem = [{ site: "example.com", user: "me", pass: "123" }];

async function handleSave() {
  await window.vault.save("TEMP", sampleItem);
  out.textContent = "saved";
}

async function handleLoad() {
  const res = await window.vault.load("TEMP");
  if (res?.ok) {
    out.textContent = JSON.stringify(res.data, null, 2);
  }
}

/* =====================================================
   LOCK / AUTO-LOCK
===================================================== */
function handleLock() {
  showScreen("unlock");
  focusUnlock();
}

function handleAutoLock() {
  showScreen("unlock");
  focusUnlock();
}

function focusUnlock() {
  requestAnimationFrame(() => {
    unlockPw?.focus();
  });
}

/* =====================================================
   ACTIVITY TRACKING
===================================================== */
function markActivity() {
  window.vault.activity();
}

/* =====================================================
   BIND EVENTS
===================================================== */
export function bindEvents() {
  // CREATE
  createBtn?.addEventListener("click", handleCreateAccount);

  // UNLOCK
  unlockBtn?.addEventListener("click", handleUnlock);
  unlockPw?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleUnlock();
  });

  // HOME
  saveBtn?.addEventListener("click", handleSave);
  loadBtn?.addEventListener("click", handleLoad);
  lockBtn?.addEventListener("click", handleLock);

  // AUTO-LOCK FROM MAIN
  window.addEventListener("vault-locked", handleAutoLock);

  // ACTIVITY
  ["mousemove", "keydown", "mousedown", "scroll", "touchstart"].forEach((e) =>
    window.addEventListener(e, markActivity)
  );
}
