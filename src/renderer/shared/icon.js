export function plusIcon({ size = 14 } = {}) {
  return `
    <svg viewBox="0 0 24 24" width="${size}" height="${size}">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  `;
}

export function copyIcon() {
  return `
    <svg viewBox="0 0 24 24" width="14" height="14" class="icon-copy">
      <rect x="9" y="9" width="11" height="11" rx="2"
        fill="none" stroke="currentColor" stroke-width="2"/>
      <rect x="4" y="4" width="11" height="11" rx="2"
        fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>
  `;
}

export function checkIcon({ size = 24 } = {}) {
  return `
    <svg
      viewBox="0 0 24 24"
      width="${size}"
      height="${size}"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon-check"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  `;
}

export function eyeIcon() {
  return `
    <svg viewBox="0 0 24 24" width="14" height="14">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  `;
}

export function editIcon() {
  return `
    <svg viewBox="0 0 24 24" width="14" height="14">
      <path d="M4 20h4l10-10-4-4L4 16v4z"
            fill="currentColor"/>
    </svg>
  `;
}

export function trashIcon() {
  return `
    <svg viewBox="0 0 24 24" width="14" height="14">
      <path d="M6 7h12l-1 14H7L6 7z"
            fill="currentColor"/>
      <path d="M9 4h6l1 2H8l1-2z"
            fill="currentColor"/>
    </svg>
  `;
}
