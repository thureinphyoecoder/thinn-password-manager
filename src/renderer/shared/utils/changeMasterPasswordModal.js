import { eyeIcon } from "../components/icon.js";

export function openChangeMasterPasswordModal({ onSuccess, onError }) {
  const existing = document.querySelector(".change-master-password-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.className = "password-prompt-modal change-master-password-modal";
  modal.innerHTML = `
    <div class="modal-card">
      <h3>Change Master Password</h3>
      <p>Enter your current password and a new password (at least 8 characters).</p>

      <div class="password-field">
        <input type="password" id="cmp-current-password" placeholder="Current password" autocomplete="current-password" />
        <button class="eye-btn" data-target="cmp-current-password" aria-label="Toggle current password">
          ${eyeIcon()}
        </button>
      </div>

      <div class="password-field">
        <input type="password" id="cmp-new-password" placeholder="New password" autocomplete="new-password" />
        <button class="eye-btn" data-target="cmp-new-password" aria-label="Toggle new password">
          ${eyeIcon()}
        </button>
      </div>
      <div id="cmp-error" class="error hidden"></div>

      <div class="modal-actions">
        <button class="btn ghost" data-action="cancel">Cancel</button>
        <button class="btn-primary" data-action="confirm">Change</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const currentPwInput = modal.querySelector("#cmp-current-password");
  const newPwInput = modal.querySelector("#cmp-new-password");
  const errorEl = modal.querySelector("#cmp-error");
  const confirmBtn = modal.querySelector('[data-action="confirm"]');
  const cancelBtn = modal.querySelector('[data-action="cancel"]');

  let busy = false;

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }

  function clearError() {
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
  }

  function close() {
    document.removeEventListener("keydown", onKeyDown);
    modal.remove();
  }

  async function submit() {
    if (busy) return;
    clearError();

    const oldPassword = currentPwInput.value.trim();
    const newPassword = newPwInput.value.trim();

    if (!oldPassword || !newPassword) {
      showError("Please fill in both fields.");
      return;
    }

    if (oldPassword === newPassword) {
      showError("New password must be different from the current password.");
      return;
    }

    busy = true;
    confirmBtn.disabled = true;
    cancelBtn.disabled = true;

    try {
      const result = await window.vault.changeMasterPassword(oldPassword, newPassword);

      if (result?.ok) {
        onSuccess?.();
        close();
        return;
      }

      const message = result?.message || "Password change failed.";
      showError(message);
      onError?.(message);
    } catch {
      const message = "Unexpected error.";
      showError(message);
      onError?.(message);
    } finally {
      busy = false;
      confirmBtn.disabled = false;
      cancelBtn.disabled = false;
    }
  }

  function onKeyDown(e) {
    if (e.key === "Escape") close();
    if (e.key === "Enter") submit();
  }

  cancelBtn.addEventListener("click", close);
  confirmBtn.addEventListener("click", submit);

  [currentPwInput, newPwInput].forEach((input) => {
    input.addEventListener("input", clearError);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  document.addEventListener("keydown", onKeyDown);
  currentPwInput.focus();
}


