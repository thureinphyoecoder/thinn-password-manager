import { loadCategories, saveCategories } from "./categoryStore.js";

const defaultCategories = [
  { id: "all", name: "All", system: true },
  { id: "work", name: "Work" },
  { id: "personal", name: "Personal" },
];

export const CategoryState = {
  categories: loadCategories() ?? defaultCategories,
  activeCategoryId: "all",
};

export function persistCategories() {
  saveCategories(CategoryState.categories);
}
