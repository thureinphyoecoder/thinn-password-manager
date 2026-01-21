export function isValidUsername(name) {
  if (typeof name !== "string") return false;
  const t = name.trim();
  if (t.length < 1 || t.length > 20) return false;
  return /^[a-zA-Z0-9_-]+$/.test(t);
}

export function normalizeUsername(name) {
  return name.replace(/[_-]/g, "");
}
