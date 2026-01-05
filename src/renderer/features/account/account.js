import { shake } from "../../shared/shake.js";
import { isValidUsername, normalizeUsername } from "./username.js";

export function initAccountSettings() {
  const input = document.querySelector(".account-row input");
  const btn = document.querySelector(".account-row button");
  const avatar = document.querySelector(".avatar-circle");

  if (!input || !btn) return;

  btn.addEventListener("click", async () => {
    const raw = input.value.trim();

    // ---------- VALIDATION ----------
    if (!raw) {
      shake(input);
      return;
    }

    if (!isValidUsername(raw)) {
      shake(input);
      return;
    }

    const clean = normalizeUsername(raw);

    if (!/^[a-zA-Z0-9]{1,20}$/.test(clean)) {
      shake(input);
      return;
    }

    // ---------- UPDATE VAULT ----------
    try {
      const vault = window.vault.getVault();
      vault.meta.username = clean;
      vault.meta.updatedAt = Date.now();

      await window.vault.persist();

      // ---------- UI UPDATE ----------
      input.value = clean;
      if (avatar) {
        avatar.textContent = clean.slice(0, 2).toUpperCase();
      }
    } catch {
      shake(input);
    }
  });
}
