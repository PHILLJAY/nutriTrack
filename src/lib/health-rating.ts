export function calculateHealthRating(meal: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | null;
  sugar?: number | null;
  sodium?: number | null;
}): number {
  let score = 70;

  // Calorie density penalty
  if (meal.calories > 800) score -= 5;

  // Protein scoring
  if (meal.protein > 25) score += 10;
  else if (meal.protein < 10) score -= 5;

  // Fiber scoring
  const fiber = meal.fiber ?? 0;
  if (fiber > 5) score += 5;
  else if (fiber < 2) score -= 5;

  // Sugar penalty
  const sugar = meal.sugar ?? 0;
  if (sugar > 30) score -= 10;
  else if (sugar > 15) score -= 5;

  // Sodium penalty
  const sodium = meal.sodium ?? 0;
  if (sodium > 1000) score -= 5;

  // Macro balance bonus
  const totalMacros = meal.protein + meal.carbs + meal.fat;
  if (totalMacros > 0) {
    const proteinPct = meal.protein / totalMacros;
    const carbsPct = meal.carbs / totalMacros;
    const fatPct = meal.fat / totalMacros;
    if (
      proteinPct >= 0.2 &&
      proteinPct <= 0.4 &&
      carbsPct >= 0.3 &&
      carbsPct <= 0.5 &&
      fatPct >= 0.2 &&
      fatPct <= 0.4
    ) {
      score += 5;
    }
  }

  // Processed food indicators (high sugar + low fiber)
  if (sugar > 20 && fiber < 2) score -= 5;

  return Math.max(0, Math.min(100, score));
}
