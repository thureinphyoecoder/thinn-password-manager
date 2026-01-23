import { toast } from "../../shared/components/toast.js";
import { shake } from "../../shared/utils/shake.js";
import { isValidUsername } from "./username.js";
import { openChangeMasterPasswordModal } from "../../shared/utils/changeMasterPasswordModal.js";

let isBound = false;

/* =========================
   INIT ACCOUNT SETTINGS EVENTS
========================= */
export function initAccountSettings() {
  if (isBound) return;

  const updateUsernameBtn = document.getElementById("update-username-btn");
  const changeMasterPwBtn = document.getElementById("change-master-pw-btn");
  const usernameInput = document.querySelector('.account-row input[type="text"]');

  if (!usernameInput) return;

  // Username Update Button
  if (updateUsernameBtn) {
    updateUsernameBtn.addEventListener("click", () => {
      handleUpdateUsername(usernameInput, updateUsernameBtn);
    });
  }

  usernameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleUpdateUsername(usernameInput, updateUsernameBtn);
    }
  });

  if (changeMasterPwBtn) {
    changeMasterPwBtn.addEventListener("click", handleChangeMasterPassword);
  }

  isBound = true;
}

/* =========================
   HANDLE USERNAME UPDATE
========================= */
async function handleUpdateUsername(inputEl, btnEl) {
  const rawUsername = inputEl.value.trim();

  const currentVault = await window.vault.loadVault();

  // ---------- VALIDATION & SHAKE ----------
  if (!rawUsername) {
    shake(inputEl);
    toast("Username cannot be empty.", "error");
    return;
  }

  if (!isValidUsername(rawUsername)) {
    shake(inputEl);
    toast("Invalid username format. Use letters and numbers only.", "error");
    return;
  }

  if (currentVault?.meta?.username === rawUsername) {
    toast("Username not changed.", "info");
    return;
  }

  // ---------- UPDATE VAULT (via IPC) ----------
  btnEl.disabled = true;
  try {
    await window.vault.updateUsername(rawUsername);

    const avatar = document.querySelector(".avatar-circle");
    if (avatar) {
      avatar.textContent = rawUsername.slice(0, 2).toUpperCase();
    }
    inputEl.value = rawUsername;

    toast("Username updated successfully!", "success");
  } catch (error) {
    console.error("Failed to update username:", error);
    shake(inputEl);
    toast("Update failed. Check app logs.", "error");
  } finally {
    btnEl.disabled = false;
  }
}

function handleChangeMasterPassword() {
  openChangeMasterPasswordModal({
    onSuccess: () => {
      toast("Master Password changed successfully!", "success");
    },
    onError: (msg) => {
      toast(msg || "Password change failed.", "error");
    },
  });
}
