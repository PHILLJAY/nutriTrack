"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import type { MealData } from "@/types";

const COLORS = ["#ef4444", "#3b82f6", "#eab308", "#22c55e"];

export default function ReportsPage() {
  const router = useRouter();
  const [meals, setMeals] = useState<MealData[]>([]);
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const start = period === "week"
      ? startOfWeek(now, { weekStartsOn: 1 })
      : startOfMonth(now);
    const end = period === "week"
      ? endOfWeek(now, { weekStartsOn: 1 })
      : endOfMonth(now);

    fetch(`/api/meals?start=${start.toISOString()}&end=${end.toISOString()}`)
      .then((r) => r.json())
      .then((data) => {
        setMeals(data.meals || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Aggregate by day
  const now = new Date();
  const days = period === "week" ? 7 : 30;
  const dailyData = Array.from({ length: days }, (_, i) => {
    const date = subDays(now, days - 1 - i);
    const dayMeals = meals.filter((m) => isSameDay(new Date(m.eatenAt), date));
    return {
      date: format(date, period === "week" ? "EEE" : "MMM d"),
      calories: dayMeals.reduce((s, m) => s + m.calories, 0),
      protein: dayMeals.reduce((s, m) => s + m.protein, 0),
      carbs: dayMeals.reduce((s, m) => s + m.carbs, 0),
      fat: dayMeals.reduce((s, m) => s + m.fat, 0),
      mealCount: dayMeals.length,
    };
  });

  // Macro totals for pie chart
  const totals = meals.reduce(
    (acc, m) => ({
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );

  const macroPieData = [
    { name: "Protein", value: Math.round(totals.protein) },
    { name: "Carbs", value: Math.round(totals.carbs) },
    { name: "Fat", value: Math.round(totals.fat) },
  ];

  // Summary stats
  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  const avgCalories = meals.length > 0 ? Math.round(totalCalories / (period === "week" ? 7 : 30)) : 0;
  const avgHealthRating = meals.length > 0
    ? Math.round(meals.reduce((s, m) => s + m.healthRating, 0) / meals.length)
    : 0;
  const daysWithMeals = dailyData.filter((d) => d.mealCount > 0).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Reports</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Period toggle */}
        <div className="flex gap-2">
          <Button
            variant={period === "week" ? "default" : "outline"}
            onClick={() => setPeriod("week")}
          >
            This Week
          </Button>
          <Button
            variant={period === "month" ? "default" : "outline"}
            onClick={() => setPeriod("month")}
          >
            This Month
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{totalCalories}</div>
              <div className="text-xs text-muted-foreground">Total Calories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{avgCalories}</div>
              <div className="text-xs text-muted-foreground">Avg Cal/Day</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{avgHealthRating}</div>
              <div className="text-xs text-muted-foreground">Avg Health Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{daysWithMeals}/{days}</div>
              <div className="text-xs text-muted-foreground">Days Logged</div>
            </CardContent>
          </Card>
        </div>

        {/* Calories bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Daily Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calories" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Macro distribution pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Macro Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={macroPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroPieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
