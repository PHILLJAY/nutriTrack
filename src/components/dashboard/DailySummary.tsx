"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { MealData } from "@/types";

interface DailySummaryProps {
  meals: MealData[];
  targets: {
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
  };
}

export function DailySummary({ meals, targets }: DailySummaryProps) {
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const caloriePct = Math.min(
    100,
    Math.round((totals.calories / targets.targetCalories) * 100)
  );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Today&apos;s Progress</h3>
          <span className="text-sm text-muted-foreground">
            {totals.calories} / {targets.targetCalories} kcal
          </span>
        </div>

        {/* Calorie bar */}
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all ${
              caloriePct > 100 ? "bg-red-500" : "bg-orange-500"
            }`}
            style={{ width: `${Math.min(100, caloriePct)}%` }}
          />
        </div>

        {/* Macro summary */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-red-500">
              {Math.round(totals.protein)}g
            </div>
            <div className="text-xs text-muted-foreground">
              Protein ({targets.targetProtein}g)
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-500">
              {Math.round(totals.carbs)}g
            </div>
            <div className="text-xs text-muted-foreground">
              Carbs ({targets.targetCarbs}g)
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-500">
              {Math.round(totals.fat)}g
            </div>
            <div className="text-xs text-muted-foreground">
              Fat ({targets.targetFat}g)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
