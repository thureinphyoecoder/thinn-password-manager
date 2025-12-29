/* =========================
   PASSWORD EYE TOGGLE (GLOBAL)
========================= */

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".eye-btn");
  if (!btn) return;

  const targetId = btn.dataset.target;
  if (!targetId) return;

  const input = document.getElementById(targetId);
  if (!input) return;

  input.type = input.type === "password" ? "text" : "password";
});
