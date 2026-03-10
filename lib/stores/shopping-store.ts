import { create } from 'zustand';
import { SHOPPING_ITEMS, type ShoppingItem } from '@/lib/data/mock';

interface ShoppingState {
  items: ShoppingItem[];
  checked: Record<string, boolean>;
  toggle: (id: string) => void;
  reset: () => void;
  /** Segna come acquistati gli item con questi id (da scansione scontrino) */
  bulkCheck: (ids: string[]) => void;
}

export const useShoppingStore = create<ShoppingState>((set) => ({
  items: [...SHOPPING_ITEMS],
  checked: {},

  toggle: (id) =>
    set((state) => ({
      checked: { ...state.checked, [id]: !state.checked[id] },
    })),

  reset: () => set({ checked: {} }),

  bulkCheck: (ids) =>
    set((state) => {
      const updated = { ...state.checked };
      ids.forEach((id) => { updated[id] = true; });
      return { checked: updated };
    }),
}));
