import { create } from 'zustand';
import { CURRENT_WEEK_PLAN, type DayPlan, type MealPlan } from '@/lib/data/mock';

function emptyWeek(): DayPlan[] {
  return Array.from({ length: 7 }, () => ({
    pranzo: { primo: null, secondo: null },
    cena: { primo: null, secondo: null },
  }));
}

interface PlannerState {
  weekPlans: Record<number, DayPlan[]>;
  getWeek: (offset: number) => DayPlan[];
  assignRecipe: (
    weekOffset: number,
    dayIndex: number,
    meal: 'pranzo' | 'cena',
    course: 'primo' | 'secondo',
    recipe: { recipeId: string; recipeName: string },
  ) => void;
  removeRecipe: (
    weekOffset: number,
    dayIndex: number,
    meal: 'pranzo' | 'cena',
    course: 'primo' | 'secondo',
  ) => void;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  weekPlans: {
    0: CURRENT_WEEK_PLAN.map((d) => ({ ...d })),
  },

  getWeek: (offset) => get().weekPlans[offset] ?? emptyWeek(),

  assignRecipe: (weekOffset, dayIndex, meal, course, recipe) =>
    set((state) => {
      const plan = [...(state.weekPlans[weekOffset] ?? emptyWeek())];
      const mealPlan: MealPlan = { ...plan[dayIndex][meal] };
      mealPlan[course] = recipe;
      plan[dayIndex] = { ...plan[dayIndex], [meal]: mealPlan };
      return { weekPlans: { ...state.weekPlans, [weekOffset]: plan } };
    }),

  removeRecipe: (weekOffset, dayIndex, meal, course) =>
    set((state) => {
      const plan = [...(state.weekPlans[weekOffset] ?? emptyWeek())];
      const mealPlan: MealPlan = { ...plan[dayIndex][meal] };
      if (course === 'primo') {
        mealPlan.primo = mealPlan.secondo;
        mealPlan.secondo = null;
      } else {
        mealPlan.secondo = null;
      }
      plan[dayIndex] = { ...plan[dayIndex], [meal]: mealPlan };
      return { weekPlans: { ...state.weekPlans, [weekOffset]: plan } };
    }),
}));
