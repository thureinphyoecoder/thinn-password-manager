import { trashIcon, checkIcon } from "../components/icon.js";

export function openConfirm({ title, message, onConfirm }) {
  console.log("CONFIRM MODULE LOADED", import.meta.url);

  const modal = document.createElement("div");
  modal.className = "confirm-modal";

  modal.innerHTML = `
    <div class="confirm-card">
      <div class="confirm-header">
        <span class="confirm-icon">${trashIcon()}</span>
        <h3>${title}</h3>
      </div>
      <p>${message}</p>
      <div class="confirm-actions">
        <button class="btn ghost cancel">Cancel</button>
        <button class="btn danger confirm">Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const card = modal.querySelector(".confirm-card");
  const cancelBtn = modal.querySelector(".cancel");
  const confirmBtn = modal.querySelector(".confirm");

  let busy = false;

  function close() {
    document.removeEventListener("keydown", onKey);
    modal.remove();
  }

  function showSuccess(text = "Deleted") {
    return new Promise((resolve) => {
        card.innerHTML = `
    <div class="confirm-success">
      ${checkIcon({ size: 20 })}
      <strong>${text}</strong>
    </div>
  `;
    setTimeout(() => {
      close();
      resolve();
    }, 900);
  
    })
  } 

  cancelBtn.onclick = close;

  confirmBtn.onclick = async () => {
    if (busy) return;
    busy = true;

    await onConfirm({
      showSuccess: (msg) => {
        return showSuccess(msg); //  call outer function
      },
    });
  };

  function onKey(e) {
    if (e.key === "Escape") close();
  }

  document.addEventListener("keydown", onKey);
}
