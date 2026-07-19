"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

interface MealPlanMeal {
  name: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
}

interface MealPlanDay {
  day: number;
  label: string;
  meals: MealPlanMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export function MealPlanGenerator() {
  const [plan, setPlan] = useState<MealPlanDay[] | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async (days: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/meals/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
        toast.success(`${days}-day meal plan generated!`);
      } else {
        toast.error("Failed to generate meal plan");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const logAllMeals = async (day: MealPlanDay) => {
    setLoading(true);
    let count = 0;
    for (const meal of day.meals) {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          mealType: meal.mealType,
          notes: meal.description,
        }),
      });
      if (res.ok) count++;
    }
    toast.success(`${count} meals logged from ${day.label}!`);
    setPlan(null);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => generatePlan(1)}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
          Generate Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generatePlan(7)}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
          Generate Week
        </Button>
      </div>

      {loading && !plan && (
        <Card>
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 mx-auto mb-2 animate-spin" />
            Generating meal plan...
          </CardContent>
        </Card>
      )}

      {plan && (
        <div className="space-y-3">
          {plan.map((day) => (
            <Card key={day.day}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{day.label}</h3>
                    <div className="text-xs text-muted-foreground">
                      {day.totalCalories} kcal · P:{day.totalProtein}g C:{day.totalCarbs}g F:{day.totalFat}g
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => logAllMeals(day)}
                    disabled={loading}
                  >
                    Log All
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {day.meals.map((meal, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-sm"
                    >
                      <div>
                        <span className="font-medium">{meal.name}</span>
                        <span className="text-xs text-muted-foreground ml-2 capitalize">
                          {meal.mealType}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {meal.calories} kcal
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
