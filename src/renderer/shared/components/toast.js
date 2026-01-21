import { checkIcon } from "../components/icon.js";

let toastEl = null;
let timer = null;

export function toast(message, options = {}) {
  const {
    duration = 1400,
    type = "default", // default | success | error
    icon = null, // "check" | null
  } = options;

  // cleanup
  if (toastEl) toastEl.remove();
  if (timer) clearTimeout(timer);

  toastEl = document.createElement("div");
  toastEl.className = `toast toast-${type}`;

  // content
  toastEl.innerHTML = `
    ${icon === "check" ? `<span class="toast-icon">${checkIcon()}</span>` : ""}
    <span class="toast-text">${message}</span>
  `;

  document.body.appendChild(toastEl);

  requestAnimationFrame(() => {
    toastEl.classList.add("show");
  });

  timer = setTimeout(() => {
    toastEl.classList.remove("show");
    toastEl.classList.add("hide");

    toastEl.addEventListener(
      "transitionend",
      () => {
        toastEl?.remove();
        toastEl = null;
      },
      { once: true }
    );
  }, duration);
}
