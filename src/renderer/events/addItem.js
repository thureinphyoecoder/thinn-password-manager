export function bindAddItemEvents() {
  const modal = document.getElementById("add-item-modal");
  if (!modal) return;

  const saveBtn = document.getElementById("save-item-btn");
  if (!saveBtn) return;

  const siteInput = document.getElementById("item-site");
  const urlInput = document.getElementById("item-url");
  const usernameInput = document.getElementById("item-username");
  const pwInput = document.getElementById("item-password");
  const noteInput = modal.querySelector("textarea");

  saveBtn.addEventListener("click", async () => {
    const site = siteInput.value.trim();
    const url = urlInput?.value.trim() || "";
    const username = usernameInput?.value.trim() || "";
    const password = pwInput.value.trim();

    if (!site || !password) return;

    const payload = {
      site,
      url,
      username,
      password,
      notes: noteInput?.value ?? "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await window.vault.addItem(payload);

    // reset
    siteInput.value = "";
    urlInput.value = "";
    usernameInput.value = "";
    pwInput.value = "";
    if (noteInput) noteInput.value = "";

    modal.classList.remove("is-open");
    setTimeout(() => (modal.hidden = true), 200);
  });
}
