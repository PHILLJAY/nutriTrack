"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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

const COLORS = ["#ef4444", "#3b82f6", "#eab308"];

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

  const macroData = [
    { name: "Protein", value: Math.round(totals.protein), target: targets.targetProtein, color: COLORS[0] },
    { name: "Carbs", value: Math.round(totals.carbs), target: targets.targetCarbs, color: COLORS[1] },
    { name: "Fat", value: Math.round(totals.fat), target: targets.targetFat, color: COLORS[2] },
  ];

  const pieData = macroData.filter((d) => d.value > 0);

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

        {/* Macro breakdown with pie chart */}
        <div className="flex items-center gap-4">
          {/* Pie chart */}
          {pieData.length > 0 && (
            <div className="w-20 h-20 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={35}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value}g`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Macro bars */}
          <div className="flex-1 space-y-2">
            {macroData.map((macro) => {
              const pct = Math.min(100, Math.round((macro.value / macro.target) * 100));
              return (
                <div key={macro.name}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span>{macro.name}</span>
                    <span className="text-muted-foreground">{macro.value}/{macro.target}g</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: macro.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
