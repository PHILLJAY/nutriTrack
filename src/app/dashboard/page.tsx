"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { WeekCalendar } from "@/components/dashboard/WeekCalendar";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { ManualMealEntry } from "@/components/dashboard/ManualMealEntry";
import { TemplatePicker } from "@/components/dashboard/TemplatePicker";
import { WaterTracker } from "@/components/dashboard/WaterTracker";
import { WeightTracker } from "@/components/dashboard/WeightTracker";
import { MealSuggestions } from "@/components/dashboard/MealSuggestions";
import { ComparisonChart } from "@/components/dashboard/ComparisonChart";
import { Upload, Camera, LogOut, Settings, BarChart3 } from "lucide-react";
import type { UserProfile, MealData } from "@/types";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDaysLogged: number;
  todayLogged: boolean;
  heatmap: { date: string; count: number }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [userRes, mealsRes, streakRes] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/meals"),
        fetch("/api/streaks"),
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
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/meals/analyze", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchData();
      } else {
        const err = await res.json();
        setUploadError(err.error || "Failed to analyze image");
      }
    } catch {
      setUploadError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse eyebrow">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="wordmark text-lg font-bold text-lime">NutriTrack</h1>
            <p className="eyebrow mt-0.5">
              Hey, {user.name}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <ManualMealEntry onSuccess={fetchData} />
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
              <input
                id="meal-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                size="sm"
                variant="outline"
                disabled={uploading}
                onClick={() => document.getElementById("meal-upload")?.click()}
              >
                {uploading ? (
                  <>Analyzing...</>
                ) : (
                  <>
                    <Camera className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Log Meal</span>
                  </>
                )}
              </Button>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => router.push("/reports")}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => router.push("/settings")}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/onboarding");
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Upload error */}
      {uploadError && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center justify-between">
            {uploadError}
            <button onClick={() => setUploadError("")} className="ml-2 font-bold">&times;</button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <SectionLabel index={1} label="Today's Targets" className="mb-4" />

        {/* Targets overview — pill stack echoing the reference's stacked badges */}
        <div className="mb-6 flex flex-wrap gap-2">
          <div className="flex-1 min-w-[7rem] rounded-full bg-lime px-4 py-2.5 text-center text-lime-foreground">
            <div className="text-xl font-bold leading-tight">{user.targetCalories}</div>
            <div className="eyebrow !text-lime-foreground/70">Cal/day</div>
          </div>
          <div className="flex-1 min-w-[7rem] rounded-full bg-lavender px-4 py-2.5 text-center text-lavender-foreground">
            <div className="text-xl font-bold leading-tight">{user.targetProtein}g</div>
            <div className="eyebrow !text-lavender-foreground/70">Protein</div>
          </div>
          <div className="flex-1 min-w-[7rem] rounded-full bg-paper px-4 py-2.5 text-center text-paper-foreground">
            <div className="text-xl font-bold leading-tight">{user.targetCarbs}g</div>
            <div className="eyebrow !text-paper-foreground/70">Carbs</div>
          </div>
          <div className="flex-1 min-w-[7rem] rounded-full bg-ink px-4 py-2.5 text-center text-ink-foreground border border-white/10">
            <div className="text-xl font-bold leading-tight">{user.targetFat}g</div>
            <div className="eyebrow !text-ink-foreground/60">Fat</div>
          </div>
        </div>

        {/* Discord link hint */}
        {!user.discordId && (
          <Card className="mb-6 border-dashed">
            <CardContent className="p-4 flex items-center gap-3">
              <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Link your Discord account</p>
                <p className="text-muted-foreground text-xs">
                  Send meal photos directly to your Discord bot for automatic
                  logging. Link your account in settings.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Calendar */}
        <WeekCalendar meals={meals} targets={user} onUpdate={fetchData} />

        {/* Streak Tracking */}
        {streak && (
          <div className="mt-8">
            <SectionLabel index={2} label="Your Streak" className="mb-4" />
            <StreakDisplay {...streak} />
          </div>
        )}

        {/* Water & Weight Tracking */}
        <div className="mt-8">
          <SectionLabel index={3} label="Vitals" className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WaterTracker />
            <WeightTracker />
          </div>
        </div>

        {/* AI Meal Suggestions */}
        <div className="mt-8">
          <SectionLabel index={4} label="Suggestions" className="mb-4" />
          <MealSuggestions />
        </div>

        {/* Week-over-Week Comparison */}
        <div className="mt-8">
          <SectionLabel index={5} label="Trends" className="mb-4" />
          <ComparisonChart />
        </div>
      </main>
    </div>
  );
}
