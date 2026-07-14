import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { nlpEditMeal } from "@/lib/gemini";
import { calculateHealthRating } from "@/lib/health-rating";

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { mealId, instruction } = await request.json();
  if (!mealId || !instruction) {
    return Response.json(
      { error: "mealId and instruction required" },
      { status: 400 }
    );
  }

  const meal = await prisma.meal.findFirst({
    where: { id: mealId, userId },
  });
  if (!meal) {
    return Response.json({ error: "Meal not found" }, { status: 404 });
  }

  const updates = await nlpEditMeal(meal, instruction);

  // Recalculate health rating if nutrition changed
  const updatedData = { ...meal, ...updates };
  const healthRating = calculateHealthRating(updatedData);

  const updatedMeal = await prisma.meal.update({
    where: { id: mealId },
    data: {
      ...updates,
      healthRating,
    },
    include: { image: true },
  });

  return Response.json({ meal: updatedMeal, updates });
}
