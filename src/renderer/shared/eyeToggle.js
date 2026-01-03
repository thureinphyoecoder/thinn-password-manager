/* =========================
   PASSWORD EYE TOGGLE (GLOBAL)
========================= */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".eye-btn");
  if (!btn) return;

  /* =========================
     MODE 1: INPUT PASSWORD
  ========================= */
  const targetId = btn.dataset.target;
  if (targetId) {
    const input = document.getElementById(targetId);
    if (!input) return;

    input.type = input.type === "password" ? "text" : "password";
    return;
  }

  /* =========================
     MODE 2: VAULT CARD PASSWORD
  ========================= */
  const row = btn.closest(".password-row");
  if (!row) return;

  const value = row.querySelector("[data-password]");
  if (!value) return;

  const real = row.dataset.password;
  const revealed = value.dataset.revealed === "true";

  value.textContent = revealed ? "••••••••" : real;
  value.dataset.revealed = revealed ? "false" : "true";
});
