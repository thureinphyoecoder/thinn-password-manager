/* =========================
   PASSWORD EYE TOGGLE (GLOBAL - - Auth Only)
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


});
