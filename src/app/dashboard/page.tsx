"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WeekCalendar } from "@/components/dashboard/WeekCalendar";
import { Upload, Camera, LogOut, Settings } from "lucide-react";
import type { UserProfile, MealData } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, mealsRes] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/meals"),
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
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/meals/analyze", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">NutriTrack</h1>
            <p className="text-xs text-muted-foreground">
              Hey, {user.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
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
                    <Camera className="h-4 w-4 mr-1" />
                    Log Meal
                  </>
                )}
              </Button>
            </div>
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
              onClick={() => {
                document.cookie = "nutritrack_session=; path=/; max-age=0";
                router.push("/onboarding");
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Targets overview */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-500">
                  {user.targetCalories}
                </div>
                <div className="text-xs text-muted-foreground">
                  Cal/day
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">
                  {user.targetProtein}g
                </div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {user.targetCarbs}g
                </div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">
                  {user.targetFat}g
                </div>
                <div className="text-xs text-muted-foreground">Fat</div>
              </div>
            </div>
          </CardContent>
        </Card>

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
      </main>
    </div>
  );
}
