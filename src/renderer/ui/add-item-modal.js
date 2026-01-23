document.addEventListener("DOMContentLoaded", () => {
  const addItemBtn = document.getElementById("add-item-btn");
  const addItemModal = document.getElementById("add-item-modal");
  const siteInput = document.getElementById("item-site");
  const pwInput = document.getElementById("item-password");
  const saveBtn = document.getElementById("save-item-btn");

  if (!addItemBtn || !addItemModal) return;

  /* =========================
     Save button state
  ========================= */
  function updateSaveState() {
    if (!siteInput || !pwInput || !saveBtn) return;

    saveBtn.disabled = !(siteInput.value.trim() && pwInput.value.trim());
  }

  siteInput?.addEventListener("input", updateSaveState);
  pwInput?.addEventListener("input", updateSaveState);

  /* =========================
     Open / Close
  ========================= */
  function openAddItemModal() {
    addItemModal.hidden = false;

    // reset state
    siteInput.value = "";
    pwInput.value = "";
    updateSaveState();

    requestAnimationFrame(() => {
      addItemModal.classList.add("is-open");
      siteInput?.focus();
    });

    document.addEventListener("keydown", trapFocus);
  }

  function closeAddItemModal() {
    addItemModal.classList.remove("is-open");

    setTimeout(() => {
      addItemModal.hidden = true;
    }, 220);

    document.removeEventListener("keydown", trapFocus);
  }

  /* =========================
     Focus trap
  ========================= */
  function trapFocus(e) {
    if (e.key !== "Tab") return;

    const focusables = addItemModal.querySelectorAll(
      "input, textarea, button:not([disabled])"
    );
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* =========================
     Bindings
  ========================= */
  addItemBtn.addEventListener("click", openAddItemModal);

  addItemModal.addEventListener("click", (e) => {
    if (e.target === addItemModal) {
      closeAddItemModal();
    }

    const action = e.target.closest("[data-action]");
    if (action?.dataset.action === "close-add-item") {
      closeAddItemModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !addItemModal.hidden) {
      closeAddItemModal();
    }
  });
});
