"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  subWeeks,
  addWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MealBubble } from "./MealBubble";
import { MealDetail } from "./MealDetail";
import { DailySummary } from "./DailySummary";
import type { MealData } from "@/types";

interface WeekCalendarProps {
  meals: MealData[];
  targets: {
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
  };
  onUpdate: () => void;
}

export function WeekCalendar({ meals, targets, onUpdate }: WeekCalendarProps) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedMeal, setSelectedMeal] = useState<MealData | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const mealsByDay = useMemo(() => {
    const map = new Map<string, MealData[]>();
    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      map.set(
        key,
        meals.filter((m) => isSameDay(new Date(m.eatenAt), day))
      );
    }
    return map;
  }, [meals, days]);

  const selectedDayMeals = useMemo(
    () =>
      meals.filter((m) => isSameDay(new Date(m.eatenAt), selectedDay)),
    [meals, selectedDay]
  );

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekStart(subWeeks(weekStart, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="font-semibold text-sm">
            {format(weekStart, "MMM d")} — {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekStart(addWeeks(weekStart, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day tabs (mobile-friendly horizontal scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayMeals = mealsByDay.get(key) || [];
          const dayCals = dayMeals.reduce((s, m) => s + m.calories, 0);
          const active = isSameDay(day, selectedDay);

          return (
            <button
              key={key}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "flex flex-col items-center min-w-[4.5rem] p-2 rounded-2xl border transition-all",
                active
                  ? "border-transparent bg-lime text-lime-foreground"
                  : "border-border bg-white/[0.02] hover:border-lime/40",
                isToday(day) && !active && "ring-1 ring-lime/40"
              )}
            >
              <span className={cn("text-xs uppercase", active ? "text-lime-foreground/70" : "text-muted-foreground")}>
                {format(day, "EEE")}
              </span>
              <span className="text-lg font-bold">
                {format(day, "d")}
              </span>
              {dayCals > 0 && (
                <span className={cn("text-[10px]", active ? "text-lime-foreground/70" : "text-muted-foreground")}>
                  {dayCals} kcal
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Daily Summary */}
      <DailySummary meals={selectedDayMeals} targets={targets} />

      {/* Meal list for selected day */}
      <div className="space-y-2">
        {selectedDayMeals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No meals logged for this day.</p>
            <p className="text-xs mt-1">
              Send a meal photo to your Discord bot or add one manually.
            </p>
          </div>
        ) : (
          selectedDayMeals.map((meal) => (
            <MealBubble
              key={meal.id}
              meal={meal}
              onClick={() => setSelectedMeal(meal)}
            />
          ))
        )}
      </div>

      {/* Meal Detail Sheet */}
      {selectedMeal && (
        <MealDetail
          meal={selectedMeal}
          open={!!selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onUpdate={() => {
            onUpdate();
            setSelectedMeal(null);
          }}
        />
      )}
    </div>
  );
}
