import { loadCategories, saveCategories } from "./categoryStore.js";

const defaultCategories = [
  { id: "all", name: "All", system: true },
  { id: "work", name: "Work" },
  { id: "personal", name: "Personal" },
];

function normalizeCategories(raw) {
  // Keep a stable "all" category in front so filters always have a fallback target.
  const list = Array.isArray(raw) ? raw.filter(Boolean) : [];

  const hasAll = list.some((c) => c?.id === "all");
  const allCategory = hasAll
    ? list.find((c) => c.id === "all")
    : { id: "all", name: "All", system: true };

  const normalized = [
    { id: "all", name: allCategory?.name || "All", system: true },
    ...list.filter((c) => c.id !== "all"),
  ];

  return normalized.length > 1 ? normalized : defaultCategories;
}

export const CategoryState = {
  categories: normalizeCategories(loadCategories() ?? defaultCategories),
  activeCategoryId: "all",
};

export function persistCategories() {
  saveCategories(CategoryState.categories);
}
