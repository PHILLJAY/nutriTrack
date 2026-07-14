import type { OnboardingData } from "@/types";

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_CALORIE_ADJUSTMENTS: Record<string, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: string
): number {
  if (gender === "female") {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return 10 * weight + 6.25 * height - 5 * age + 5;
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  return bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.2);
}

export function calculateTargets(data: OnboardingData) {
  const bmr = calculateBMR(data.weight, data.height, data.age, data.gender);
  const tdee = calculateTDEE(bmr, data.activityLevel);
  const adjustment = GOAL_CALORIE_ADJUSTMENTS[data.goal] || 0;
  const targetCalories = Math.round(tdee + adjustment);

  // 30% protein, 40% carbs, 30% fat
  const targetProtein = Math.round((targetCalories * 0.3) / 4); // 4 cal per gram
  const targetCarbs = Math.round((targetCalories * 0.4) / 4);
  const targetFat = Math.round((targetCalories * 0.3) / 9); // 9 cal per gram

  return { targetCalories, targetProtein, targetCarbs, targetFat };
}
