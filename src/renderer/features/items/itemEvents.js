import { handleSaveItem, openEditModal } from "./itemService.js"; 
import { 
  handleDeleteItem, 
  handleCopyItem, 
  handleTogglePassword 
} from "./itemState.js"; 

/* =========================
   ADD / UPDATE Modal Events
========================= */
export function bindAddItemEvents() {
  const saveBtn = document.getElementById("save-item-btn");
  if (!saveBtn) return;

  saveBtn.onclick = handleSaveItem; 
  
 
}

/* =========================
   ITEM ACTIONS Listener (Delegation)
========================= */
let isActionBound = false;

export function bindItemActions() {
  if (isActionBound) {
    return;
  }

  const list = document.getElementById("vault-list");
  if (!list) return;

  list.addEventListener("click", async (e) => {
    const card = e.target.closest(".vault-card");
    if (!card) return;

    const id = card.dataset.id;
    if (!id) return;

    // EDIT
    if (e.target.closest("[data-action='edit']")) {
      openEditModal(id); // Service Logic 
      return;
    }

    // DELETE
    if (e.target.closest("[data-action='delete']")) {
      handleDeleteItem(id); //  Action Logic 
      return;
    }

    // TOGGLE PASSWORD
    if (e.target.closest("[data-action='toggle-password']")) {
      handleTogglePassword(card); // Action Logic
    }

    // COPY
    const copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) {
      const key = copyBtn.dataset.copy;
      handleCopyItem(copyBtn, id, key); //  Action Logic 
      return;
    }
  });

  isActionBound = true;
}
