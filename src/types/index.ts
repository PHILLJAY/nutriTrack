export interface UserProfile {
  id: string;
  discordId?: string;
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  activityLevel: string;
  goal: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  timezone: string;
}

export interface MealData {
  id: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  healthRating: number;
  mealType: string;
  eatenAt: string;
  notes?: string;
  source: string;
  imageId?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeminiMealAnalysis {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  healthRating: number;
  mealType: string;
  notes: string;
}

export interface OnboardingData {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  activityLevel: string;
  goal: string;
}
