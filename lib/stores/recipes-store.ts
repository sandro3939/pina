import { create } from 'zustand';
import { RECIPES, type Recipe } from '@/lib/data/mock';

interface RecipesState {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  removeRecipe: (id: string) => void;
}

export const useRecipesStore = create<RecipesState>((set) => ({
  recipes: [...RECIPES],

  addRecipe: (recipe) =>
    set((state) => ({
      recipes: [{ ...recipe, id: Date.now().toString() }, ...state.recipes],
    })),

  removeRecipe: (id) =>
    set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) })),
}));
