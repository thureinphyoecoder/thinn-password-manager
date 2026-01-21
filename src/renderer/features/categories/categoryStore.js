const KEY = "categories";

export function loadCategories() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCategories(categories) {
  localStorage.setItem(KEY, JSON.stringify(categories));
}
