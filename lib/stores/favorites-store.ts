import { create } from 'zustand';

export interface FavoriteItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
}

const INITIAL_FAVORITES: FavoriteItem[] = [
  { id: 'f1', name: 'Yogurt greco', category: 'Latticini e Uova', quantity: '4 pz' },
  { id: 'f2', name: 'Barrette di avena', category: 'Snack', quantity: '6 pz' },
  { id: 'f3', name: 'Frutta mista', category: 'Frutta e Verdura', quantity: '1 kg' },
  { id: 'f4', name: 'Crackers integrali', category: 'Snack', quantity: '1 conf' },
  { id: 'f5', name: 'Succo di arancia', category: 'Bevande', quantity: '1 L' },
];

interface FavoritesState {
  favorites: FavoriteItem[];
  /** Quali preferiti sono stati aggiunti alla spesa di questa settimana */
  inCart: Record<string, boolean>;
  /** Quali preferiti in carrello sono stati acquistati */
  checked: Record<string, boolean>;

  toggleInCart: (id: string) => void;
  toggleChecked: (id: string) => void;
  /** Aggiunge un nuovo preferito e opzionalmente lo mette subito in carrello */
  addFavorite: (item: Omit<FavoriteItem, 'id'>, addToCart?: boolean) => void;
  removeFavorite: (id: string) => void;
  /** Chiamato dallo scontrino: check i preferiti in cart che matchano i nomi riconosciuti */
  bulkCheckByName: (names: string[]) => void;
  /** Resetta carrello e checked (inizio nuova settimana) */
  resetWeek: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set) => ({
  favorites: [...INITIAL_FAVORITES],
  inCart: {},
  checked: {},

  toggleInCart: (id) =>
    set((state) => {
      const willBeInCart = !state.inCart[id];
      const newChecked = { ...state.checked };
      if (!willBeInCart) delete newChecked[id];
      return {
        inCart: { ...state.inCart, [id]: willBeInCart },
        checked: newChecked,
      };
    }),

  toggleChecked: (id) =>
    set((state) => ({
      checked: { ...state.checked, [id]: !state.checked[id] },
    })),

  addFavorite: (item, addToCart = true) =>
    set((state) => {
      const newItem: FavoriteItem = { ...item, id: `f-${Date.now()}` };
      return {
        favorites: [...state.favorites, newItem],
        inCart: addToCart
          ? { ...state.inCart, [newItem.id]: true }
          : state.inCart,
      };
    }),

  removeFavorite: (id) =>
    set((state) => {
      const newInCart = { ...state.inCart };
      const newChecked = { ...state.checked };
      delete newInCart[id];
      delete newChecked[id];
      return {
        favorites: state.favorites.filter((f) => f.id !== id),
        inCart: newInCart,
        checked: newChecked,
      };
    }),

  bulkCheckByName: (names) =>
    set((state) => {
      const lowerNames = names.map((n) => n.toLowerCase());
      const newChecked = { ...state.checked };
      state.favorites.forEach((f) => {
        if (!state.inCart[f.id]) return;
        const fn = f.name.toLowerCase();
        if (lowerNames.some((n) => n.includes(fn) || fn.includes(n))) {
          newChecked[f.id] = true;
        }
      });
      return { checked: newChecked };
    }),

  resetWeek: () => set({ inCart: {}, checked: {} }),
}));
