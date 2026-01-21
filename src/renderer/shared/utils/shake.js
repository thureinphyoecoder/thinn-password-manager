export function shake(el) {
  if (!el) return;

  el.classList.remove("shake");
  void el.offsetWidth; // force reflow
  el.classList.add("shake");
}
