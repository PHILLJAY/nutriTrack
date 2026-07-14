"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, ArrowLeftRight } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import type { MealData } from "@/types";

interface PeriodStats {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  avgHealth: number;
  mealCount: number;
  daysLogged: number;
}

function getStats(meals: MealData[], days: number): PeriodStats {
  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = meals.reduce((s, m) => s + m.fat, 0);
  const avgHealth = meals.length > 0
    ? Math.round(meals.reduce((s, m) => s + m.healthRating, 0) / meals.length)
    : 0;

  const uniqueDays = new Set(
    meals.map((m) => new Date(m.eatenAt).toISOString().split("T")[0])
  ).size;

  return {
    calories: Math.round(totalCalories / days),
    protein: Math.round(totalProtein / days),
    carbs: Math.round(totalCarbs / days),
    fat: Math.round(totalFat / days),
    avgHealth,
    mealCount: meals.length,
    daysLogged: uniqueDays,
  };
}

function DeltaBadge({ current, previous, unit = "" }: { current: number; previous: number; unit?: string }) {
  const diff = current - previous;
  const pct = previous > 0 ? Math.round((diff / previous) * 100) : 0;

  if (diff === 0) {
    return <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Minus className="h-3 w-3" /> No change</span>;
  }

  const isPositive = diff > 0;
  return (
    <span className={`text-xs flex items-center gap-0.5 ${isPositive ? "text-red-500" : "text-green-500"}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive ? "+" : ""}{diff}{unit} ({isPositive ? "+" : ""}{pct}%)
    </span>
  );
}

export function ComparisonChart() {
  const [thisWeek, setThisWeek] = useState<PeriodStats | null>(null);
  const [lastWeek, setLastWeek] = useState<PeriodStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subDays(now, 7), { weekStartsOn: 1 });

    Promise.all([
      fetch(`/api/meals?start=${thisWeekStart.toISOString()}&end=${thisWeekEnd.toISOString()}`).then((r) => r.json()),
      fetch(`/api/meals?start=${lastWeekStart.toISOString()}&end=${lastWeekEnd.toISOString()}`).then((r) => r.json()),
    ])
      .then(([thisData, lastData]) => {
        setThisWeek(getStats(thisData.meals || [], 7));
        setLastWeek(getStats(lastData.meals || [], 7));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground text-sm">
          Loading comparison...
        </CardContent>
      </Card>
    );
  }

  if (!thisWeek || !lastWeek) return null;

  const metrics = [
    { label: "Avg Cal/Day", current: thisWeek.calories, previous: lastWeek.calories, unit: " kcal" },
    { label: "Avg Protein/Day", current: thisWeek.protein, previous: lastWeek.protein, unit: "g" },
    { label: "Avg Carbs/Day", current: thisWeek.carbs, previous: lastWeek.carbs, unit: "g" },
    { label: "Avg Fat/Day", current: thisWeek.fat, previous: lastWeek.fat, unit: "g" },
    { label: "Avg Health Score", current: thisWeek.avgHealth, previous: lastWeek.avgHealth, unit: "" },
    { label: "Meals Logged", current: thisWeek.mealCount, previous: lastWeek.mealCount, unit: "" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          This Week vs Last Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between">
              <span className="text-sm">{m.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{m.current}{m.unit}</span>
                <DeltaBadge current={m.current} previous={m.previous} unit={m.unit} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
