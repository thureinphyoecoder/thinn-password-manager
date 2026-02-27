import { renderHome } from "../../ui/views/home.js";
import { openConfirm } from "../../shared/utils/confirm.js";
import { checkIcon } from "../../shared/components/icon.js";
import { toast } from "../../shared/components/toast.js";

import { openEditModal } from "./itemService.js";

/* =========================
   ITEM ACTION HANDLERS
========================= */

// DELETE Handler
// export function handleDeleteItem(id) {
//   openConfirm({
//     title: "Delete item",
//     message: "Delete this item?",
//     onConfirm: async ({ showSuccess }) => {
//       const updatedVault = await window.vault.deleteItem(id);
//       renderHome(updatedVault);
//       await showSuccess("Deleted");
//     },
//   });
// }

export function handleDeleteItem(id) {
  openConfirm({
    title: "Delete item",
    message: "Delete this item?",
    onConfirm: async ({ showSuccess }) => {
      await window.vault.deleteItem(id);

      const vault = await window.vault.loadVault(); // 🔥 single source
      renderHome(vault);

      await showSuccess("Deleted");
    },
  });
}

// COPY Handler
export async function handleCopyItem(copyBtn, id, key) {
  const ok = await window.vault.copyField(id, key);

  if (ok) {
    toast("Copied", "success");

    // Check Icon Logic
    const originalIcon = copyBtn.innerHTML;
    copyBtn.innerHTML = checkIcon();

    setTimeout(() => {
      copyBtn.innerHTML = originalIcon;
    }, 1200);
  }
}

// TOGGLE PASSWORD Handler
export async function handleTogglePassword(card) {
  const row = card.querySelector(".vault-row.password");
  if (!row) return;

  const val = row.querySelector(".password-value");
  if (!val) return;
  const id = card.dataset.id;
  if (!id) return;

  const visible = val.textContent !== "••••••••••";
  if (visible) {
    val.textContent = "••••••••••";
    return;
  }

  try {
    const pw = await window.vault.getField(id, "password");
    if (typeof pw === "string" && pw.length) {
      val.textContent = pw;
    }
  } catch {
    val.textContent = "••••••••••";
  }
}
