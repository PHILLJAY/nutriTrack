"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { Skeleton } from "@/components/ui/skeleton";
import { WeekCalendar } from "@/components/dashboard/WeekCalendar";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { ManualMealEntry } from "@/components/dashboard/ManualMealEntry";
import { TemplatePicker } from "@/components/dashboard/TemplatePicker";
import { WaterTracker } from "@/components/dashboard/WaterTracker";
import { WeightTracker } from "@/components/dashboard/WeightTracker";
import { MealSuggestions } from "@/components/dashboard/MealSuggestions";
import { MealPlanGenerator } from "@/components/dashboard/MealPlanGenerator";
import { GroceryList } from "@/components/dashboard/GroceryList";
import { ComparisonChart } from "@/components/dashboard/ComparisonChart";
import { BarcodeScanner } from "@/components/dashboard/BarcodeScanner";
import { Upload, Camera, LogOut, Settings, BarChart3, Star } from "lucide-react";
import type { UserProfile, MealData } from "@/types";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDaysLogged: number;
  todayLogged: boolean;
  heatmap: { date: string; count: number }[];
}

interface FavoriteTemplate {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  isFavorite: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteTemplate[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, mealsRes, streakRes, templatesRes] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/meals"),
        fetch("/api/streaks"),
        fetch("/api/templates"),
      ]);

      if (userRes.status === 401) {
        router.push("/onboarding");
        return;
      }

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      if (mealsRes.ok) {
        const mealsData = await mealsRes.json();
        setMeals(
          mealsData.meals.map((m: MealData & { image?: { path: string } }) => ({
            ...m,
            imageUrl: m.image?.path || null,
          }))
        );
      }

      if (streakRes.ok) {
        setStreak(await streakRes.json());
      }

      if (templatesRes.ok) {
        const tplData = await templatesRes.json();
        setFavorites((tplData.templates || []).filter((t: FavoriteTemplate) => t.isFavorite).slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.closest("[role='dialog']")) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        document.getElementById("manual-meal-trigger")?.click();
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        router.push("/settings");
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        router.push("/reports");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < fileList.length; i++) {
        formData.append("image", fileList[i]);
      }

      const res = await fetch("/api/meals/analyze", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        await fetchData();
        toast.success(data.count ? `${data.count} meals logged!` : "Meal analyzed and logged!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to analyze image");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const quickLog = async (template: FavoriteTemplate) => {
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: template.name,
        calories: template.calories,
        protein: template.protein,
        carbs: template.carbs,
        fat: template.fat,
        mealType: template.mealType,
      }),
    });
    if (res.ok) {
      toast.success(`Logged: ${template.name}`);
      fetchData();
    } else {
      toast.error("Failed to log meal");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen max-w-4xl mx-auto px-4 py-6 space-y-8">
        <div className="flex justify-between items-center py-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="flex-1 min-w-[7rem] h-16 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="wordmark text-lg font-bold text-lime">NutriTrack</h1>
            <p className="eyebrow mt-0.5">Hey, {user.name}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <ManualMealEntry onSuccess={fetchData} />
            <BarcodeScanner onSuccess={fetchData} />
            <div className="hidden sm:block">
              <TemplatePicker
                onSelect={async (template) => {
                  await fetch("/api/meals", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: template.name,
                      calories: template.calories,
                      protein: template.protein,
                      carbs: template.carbs,
                      fat: template.fat,
                      mealType: template.mealType,
                    }),
                  });
                  fetchData();
                }}
              />
            </div>
            <div>
              <input id="meal-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              <Button size="sm" variant="outline" disabled={uploading} onClick={() => document.getElementById("meal-upload")?.click()}>
                {uploading ? <>Analyzing...</> : <><Camera className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Log Meal</span></>}
              </Button>
            </div>
            <Button size="icon" variant="ghost" onClick={() => router.push("/reports")}><BarChart3 className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => router.push("/settings")}><Settings className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/onboarding"); }}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <SectionLabel index={1} label="Today's Targets" className="mb-4" />
        <div className="mb-6 flex flex-wrap gap-2">
          <div className="flex-1 min-w-[7rem] rounded-full bg-lime px-4 py-2.5 text-center text-lime-foreground"><div className="text-xl font-bold leading-tight">{user.targetCalories}</div><div className="eyebrow !text-lime-foreground/70">Cal/day</div></div>
          <div className="flex-1 min-w-[7rem] rounded-full bg-lavender px-4 py-2.5 text-center text-lavender-foreground"><div className="text-xl font-bold leading-tight">{user.targetProtein}g</div><div className="eyebrow !text-lavender-foreground/70">Protein</div></div>
          <div className="flex-1 min-w-[7rem] rounded-full bg-paper px-4 py-2.5 text-center text-paper-foreground"><div className="text-xl font-bold leading-tight">{user.targetCarbs}g</div><div className="eyebrow !text-paper-foreground/70">Carbs</div></div>
          <div className="flex-1 min-w-[7rem] rounded-full bg-ink px-4 py-2.5 text-center text-ink-foreground border border-white/10"><div className="text-xl font-bold leading-tight">{user.targetFat}g</div><div className="eyebrow !text-ink-foreground/60">Fat</div></div>
        </div>

        {favorites.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2"><Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" /><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Log</span></div>
            <div className="flex flex-wrap gap-2">
              {favorites.map((f) => (
                <button key={f.id} onClick={() => quickLog(f)} className="px-3 py-2 rounded-xl border border-border bg-white/[0.02] hover:bg-lime/10 hover:border-lime/40 transition-all text-left">
                  <div className="text-sm font-medium">{f.name}</div><div className="text-xs text-muted-foreground">{f.calories} kcal</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {!user.discordId && (
          <Card className="mb-6 border-dashed">
            <CardContent className="p-4 flex items-center gap-3">
              <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="text-sm"><p className="font-medium">Link your Discord account</p><p className="text-muted-foreground text-xs">Send meal photos directly to your Discord bot for automatic logging. Link your account in settings.</p></div>
            </CardContent>
          </Card>
        )}

        <WeekCalendar meals={meals} targets={user} onUpdate={fetchData} />

        {streak && <div className="mt-8"><SectionLabel index={2} label="Your Streak" className="mb-4" /><StreakDisplay {...streak} /></div>}

        <div className="mt-8"><SectionLabel index={3} label="Vitals" className="mb-4" /><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><WaterTracker /><WeightTracker /></div></div>

        <div className="mt-8"><SectionLabel index={4} label="Suggestions" className="mb-4" /><MealSuggestions /></div>

        <div className="mt-8"><SectionLabel index={5} label="Meal Plan" className="mb-4" /><MealPlanGenerator /></div>

        <div className="mt-8"><SectionLabel index={6} label="Groceries" className="mb-4" /><GroceryList /></div>

        <div className="mt-8"><SectionLabel index={7} label="Trends" className="mb-4" /><ComparisonChart /></div>
      </main>
    </div>
  );
}
