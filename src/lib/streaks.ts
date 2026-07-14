import { prisma } from "@/lib/db";
import { startOfDay, subDays, differenceInCalendarDays } from "date-fns";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDaysLogged: number;
  todayLogged: boolean;
  heatmap: { date: string; count: number }[];
}

export async function calculateStreak(userId: string): Promise<StreakData> {
  const meals = await prisma.meal.findMany({
    where: { userId },
    select: { eatenAt: true },
    orderBy: { eatenAt: "asc" },
  });

  if (meals.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalDaysLogged: 0, todayLogged: false, heatmap: [] };
  }

  // Get unique days with meals
  const daysWithMeals = new Set(
    meals.map((m) => startOfDay(m.eatenAt).toISOString().split("T")[0])
  );

  const uniqueDays = Array.from(daysWithMeals).sort();
  const today = startOfDay(new Date()).toISOString().split("T")[0];
  const todayLogged = daysWithMeals.has(today);

  // Calculate current streak (consecutive days ending today or yesterday)
  let currentStreak = 0;
  let checkDate = todayLogged ? new Date() : subDays(new Date(), 1);
  while (daysWithMeals.has(startOfDay(checkDate).toISOString().split("T")[0])) {
    currentStreak++;
    checkDate = subDays(checkDate, 1);
  }

  // Calculate longest streak
  let longestStreak = 0;
  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const diff = differenceInCalendarDays(
      new Date(uniqueDays[i]),
      new Date(uniqueDays[i - 1])
    );
    if (diff === 1) {
      streak++;
    } else {
      longestStreak = Math.max(longestStreak, streak);
      streak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, streak);

  // Build heatmap (last 90 days)
  const heatmap: { date: string; count: number }[] = [];
  for (let i = 89; i >= 0; i--) {
    const date = startOfDay(subDays(new Date(), i)).toISOString().split("T")[0];
    heatmap.push({
      date,
      count: daysWithMeals.has(date) ? 1 : 0,
    });
  }

  return {
    currentStreak,
    longestStreak,
    totalDaysLogged: uniqueDays.length,
    todayLogged,
    heatmap,
  };
}
