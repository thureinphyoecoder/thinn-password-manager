export function openModal(modalEl) {
  modalEl.hidden = false;
  requestAnimationFrame(() => {
    modalEl.classList.add("is-open");
  });
}

export function closeModal(modalEl) {
  modalEl.classList.remove("is-open");
  setTimeout(() => {
    modalEl.hidden = true;
  }, 200);
}
