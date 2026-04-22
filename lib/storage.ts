import { HtmlItem } from "./types";

const STORAGE_KEY = "html-vault-items";

export function getItems(): HtmlItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveItems(items: HtmlItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addItem(item: Omit<HtmlItem, "id" | "createdAt" | "updatedAt">): HtmlItem {
  const now = new Date().toISOString();
  const newItem: HtmlItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  const items = getItems();
  saveItems([newItem, ...items]);
  return newItem;
}

export function updateItem(id: string, updates: Partial<HtmlItem>): HtmlItem | null {
  const items = getItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const updated = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  items[idx] = updated;
  saveItems(items);
  return updated;
}

export function deleteItem(id: string): void {
  const items = getItems();
  saveItems(items.filter((i) => i.id !== id));
}

export function toggleFavorite(id: string): void {
  const items = getItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return;
  items[idx].favorite = !items[idx].favorite;
  items[idx].updatedAt = new Date().toISOString();
  saveItems(items);
}

export function getCategories(items: HtmlItem[]): string[] {
  const cats = new Set(items.map((i) => i.category).filter(Boolean));
  return Array.from(cats).sort();
}

export function getAllTags(items: HtmlItem[]): string[] {
  const tags = new Set(items.flatMap((i) => i.tags));
  return Array.from(tags).sort();
}
