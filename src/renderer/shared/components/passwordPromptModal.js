import { openModal, closeModal } from "../../ui/modal.js";

let currentConfirmHandler = null;

export function openPasswordPrompt({ title, description, onConfirm }) {
  const modal = document.getElementById("password-prompt-modal");

  const titleEl = modal.querySelector("#pp-title");
  const descEl = modal.querySelector("#pp-desc");
  const input = modal.querySelector("#pp-input");
  const error = modal.querySelector("#pp-error");
  const cancelBtn = modal.querySelector("[data-action=cancel]");
  const confirmBtn = modal.querySelector("[data-action=confirm]");

  titleEl.textContent = title;
  descEl.textContent = description;
  input.value = "";
  error.classList.add("hidden");

  currentConfirmHandler = onConfirm;

  openModal(modal);
  input.focus();

  cancelBtn.onclick = () => closeModal(modal);

  // 🔥 bind ONCE only
  if (!confirmBtn.dataset.bound) {
    confirmBtn.dataset.bound = "true";

    confirmBtn.addEventListener("click", async () => {
      const password = input.value.trim();

      if (!password) return;

      error.classList.add("hidden");

      try {
        await currentConfirmHandler(password);
        closeModal(modal);
      } catch (err) {
        error.textContent = err.message || "Operation failed";
        error.classList.remove("hidden");
      }
    });
  }
}
