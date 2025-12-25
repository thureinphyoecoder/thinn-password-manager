import { showScreen } from "./ui.js";

/* =====================================================
   DOM REFERENCES
===================================================== */
const createUsername = document.getElementById("create-username");
const createPw = document.getElementById("create-pw");
const confirmPw = document.getElementById("confirm-pw");
const createBtn = document.getElementById("create-btn");
const createMsg = document.getElementById("create-msg");

const unlockPw = document.getElementById("unlock-pw");
const unlockBtn = document.getElementById("unlock-btn");
const unlockMsg = document.getElementById("unlock-msg");

const lockBtn = document.getElementById("lock-btn");
const saveBtn = document.getElementById("save-btn");
const loadBtn = document.getElementById("load-btn");
const out = document.getElementById("out");

/* =====================================================
   CREATE ACCOUNT
===================================================== */
async function handleCreateAccount() {
  const username = createUsername.value.trim();
  const pw = createPw.value;
  const confirm = confirmPw.value;

  if (!username || !pw || !confirm) {
    createMsg.textContent = "All fields are required";
    return;
  }

  if (pw !== confirm) {
    createMsg.textContent = "Passwords do not match";
    return;
  }

  // Initial vault structure
  const initialVault = {
    meta: {
      username,
      createdAt: Date.now(),
    },
    items: [],
  };

  await window.vault.save(pw, initialVault);

  // Clean sensitive inputs
  createUsername.value = "";
  createPw.value = "";
  confirmPw.value = "";
  createMsg.textContent = "";

  showScreen("home");
}

/* =====================================================
   UNLOCK
===================================================== */
async function handleUnlock() {
  if (!unlockPw.value) return;

  try {
    const res = await window.vault.load(unlockPw.value);

    if (!res.ok) {
      unlockMsg.textContent = "Wrong password";
      return;
    }

    out.textContent = JSON.stringify(res.data, null, 2);
    unlockMsg.textContent = "";
    showScreen("home");
  } finally {
    unlockPw.value = "";
  }
}

/* =====================================================
   HOME ACTIONS (TEMP SAMPLE)
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
   MANUAL LOCK
===================================================== */
function handleLock() {
  showScreen("unlock");
}

/* =====================================================
   AUTO-LOCK EVENT (FROM MAIN PROCESS)
===================================================== */
function handleAutoLock() {
  showScreen("unlock");
}

/* =====================================================
   ACTIVITY TRACKING
===================================================== */
function markActivity() {
  window.vault.activity();
}

/* =====================================================
   BIND EVENTS (ENTRY)
===================================================== */
export function bindEvents() {
  /* Create */
  createBtn?.addEventListener("click", handleCreateAccount);

  /* Unlock */
  unlockBtn?.addEventListener("click", handleUnlock);
  unlockPw?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleUnlock();
  });

  /* Home */
  saveBtn?.addEventListener("click", handleSave);
  loadBtn?.addEventListener("click", handleLoad);
  lockBtn?.addEventListener("click", handleLock);

  /* Auto-lock from main */
  window.addEventListener("vault-locked", handleAutoLock);

  /* Activity */
  ["mousemove", "keydown", "mousedown", "scroll", "touchstart"].forEach((e) =>
    window.addEventListener(e, markActivity)
  );
}
