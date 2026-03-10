import { create } from 'zustand';
import { PANTRY_ITEMS, PANTRY_CATEGORIES, type PantryItem } from '@/lib/data/mock';

interface PantryState {
  items: PantryItem[];
  categories: string[];
  toggle: (id: string) => void;
  /** Aggiorna hasIt per gli item che matchano i nomi dati */
  bulkSetHasIt: (names: string[], hasIt: boolean) => void;
  /** Aggiunge nuovi item (es. da scontrino, non ancora in dispensa) */
  addItems: (newItems: Array<{ name: string; category: string }>) => void;
}

export const usePantryStore = create<PantryState>((set) => ({
  items: [...PANTRY_ITEMS],
  categories: [...PANTRY_CATEGORIES],

  toggle: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, hasIt: !item.hasIt } : item,
      ),
    })),

  bulkSetHasIt: (names, hasIt) =>
    set((state) => ({
      items: state.items.map((item) =>
        names.some((n) => n.toLowerCase() === item.name.toLowerCase())
          ? { ...item, hasIt }
          : item,
      ),
    })),

  addItems: (newItems) =>
    set((state) => {
      const existingNames = new Set(state.items.map((i) => i.name.toLowerCase()));
      const toAdd: PantryItem[] = newItems
        .filter((i) => !existingNames.has(i.name.toLowerCase()))
        .map((i, idx) => ({
          id: `receipt-${Date.now()}-${idx}`,
          name: i.name,
          category: i.category,
          hasIt: true,
        }));
      const newCategories = [...state.categories];
      toAdd.forEach((item) => {
        if (!newCategories.includes(item.category)) newCategories.push(item.category);
      });
      return { items: [...state.items, ...toAdd], categories: newCategories };
    }),
}));
