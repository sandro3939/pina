export interface ImportedRecipeDto {
  name: string;
  description?: string;
  tags: string[];
  servings: number;
  timeMinutes: number;
  ingredients: { name: string; amount: string }[];
  steps: string[];
}
