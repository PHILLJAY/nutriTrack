"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
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

const COLORS = ["#cbbcf2", "#7fd8c4", "#f2b45c", "#c8f13e"];

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
        <div className="animate-pulse eyebrow">Loading...</div>
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
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="wordmark text-lg font-bold">Reports</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <SectionLabel index={1} label={period === "week" ? "This Week" : "This Month"} />

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

        {/* Summary pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="rounded-full bg-lime px-4 py-3 text-center text-lime-foreground">
            <div className="text-xl font-bold leading-tight">{totalCalories}</div>
            <div className="eyebrow !text-lime-foreground/70">Total Calories</div>
          </div>
          <div className="rounded-full bg-lavender px-4 py-3 text-center text-lavender-foreground">
            <div className="text-xl font-bold leading-tight">{avgCalories}</div>
            <div className="eyebrow !text-lavender-foreground/70">Avg Cal/Day</div>
          </div>
          <div className="rounded-full bg-paper px-4 py-3 text-center text-paper-foreground">
            <div className="text-xl font-bold leading-tight">{avgHealthRating}</div>
            <div className="eyebrow !text-paper-foreground/70">Avg Health</div>
          </div>
          <div className="rounded-full bg-ink px-4 py-3 text-center text-ink-foreground border border-white/10">
            <div className="text-xl font-bold leading-tight">{daysWithMeals}/{days}</div>
            <div className="eyebrow !text-ink-foreground/60">Days Logged</div>
          </div>
        </div>

        {/* Calories bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Daily Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fill: "var(--muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                    color: "var(--foreground)",
                  }}
                />
                <Bar dataKey="calories" fill="var(--lime)" radius={[6, 6, 0, 0]} />
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
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                    color: "var(--foreground)",
                  }}
                />
                <Legend wrapperStyle={{ color: "var(--muted-foreground)" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
