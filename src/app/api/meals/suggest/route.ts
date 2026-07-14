import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { suggestMeals } from "@/lib/gemini";
import { getStartOfDayInTimezone, getEndOfDayInTimezone } from "@/lib/timezone";

export async function GET() {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const tz = user.timezone || "UTC";
  const meals = await prisma.meal.findMany({
    where: {
      userId,
      eatenAt: { gte: getStartOfDayInTimezone(tz), lte: getEndOfDayInTimezone(tz) },
    },
  });

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const remaining = {
    calories: Math.max(0, user.targetCalories - totals.calories),
    protein: Math.max(0, user.targetProtein - totals.protein),
    carbs: Math.max(0, user.targetCarbs - totals.carbs),
    fat: Math.max(0, user.targetFat - totals.fat),
    goal: user.goal,
    recentMeals: meals.map((m) => m.name),
  };

  if (remaining.calories < 100) {
    return Response.json({
      suggestions: [],
      message: "You've hit your calorie target for today!",
    });
  }

  try {
    const suggestions = await suggestMeals(remaining);
    return Response.json({ suggestions, remaining });
  } catch {
    return Response.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
