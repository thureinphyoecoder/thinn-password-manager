export function bindAddItemEvents() {
  const modal = document.getElementById("add-item-modal");
  const saveBtn = document.getElementById("save-item-btn");

  const siteInput = document.getElementById("item-site");
  const pwInput = document.getElementById("item-password");
  const noteInput = modal.querySelector("textarea");

  if (!saveBtn) return;

  saveBtn.addEventListener("click", async () => {
    const site = siteInput.value.trim();
    const password = pwInput.value.trim();

    if (!site || !password) return;

    const payload = {
      site,
      username: "", // later
      password,
      notes: noteInput?.value ?? "",
    };

    await window.vault.addItem(payload);

    // reset + close
    siteInput.value = "";
    pwInput.value = "";
    if (noteInput) noteInput.value = "";

    modal.classList.remove("is-open");
    setTimeout(() => (modal.hidden = true), 200);
  });
}
