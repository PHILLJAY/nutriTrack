"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MealData } from "@/types";

interface MealBubbleProps {
  meal: MealData;
  onClick: () => void;
}

const MEAL_COLORS: Record<string, string> = {
  breakfast: "bg-[#f2b45c]/15 border-[#f2b45c]/40 text-[#f2b45c]",
  lunch: "bg-lime/15 border-lime/40 text-lime",
  dinner: "bg-[#7fd8c4]/15 border-[#7fd8c4]/40 text-[#7fd8c4]",
  snack: "bg-lavender/15 border-lavender/40 text-lavender",
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
        "w-full rounded-xl border text-left transition-all hover:brightness-110 cursor-pointer",
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
