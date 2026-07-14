"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MealData } from "@/types";

interface MealBubbleProps {
  meal: MealData;
  onClick: () => void;
}

const MEAL_COLORS: Record<string, string> = {
  breakfast: "bg-amber-100 border-amber-300 text-amber-900",
  lunch: "bg-green-100 border-green-300 text-green-900",
  dinner: "bg-blue-100 border-blue-300 text-blue-900",
  snack: "bg-purple-100 border-purple-300 text-purple-900",
};

export function MealBubble({ meal, onClick }: MealBubbleProps) {
  const colorClass = MEAL_COLORS[meal.mealType] || MEAL_COLORS.snack;
  const size =
    meal.calories > 600
      ? "p-3"
      : meal.calories > 300
      ? "p-2"
      : "p-1.5";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border text-left transition-all hover:shadow-md cursor-pointer",
        size,
        colorClass
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="font-medium text-xs truncate">{meal.name}</span>
        <Badge variant="secondary" className="text-[10px] shrink-0 px-1.5 py-0">
          {meal.calories}
        </Badge>
      </div>
    </button>
  );
}
