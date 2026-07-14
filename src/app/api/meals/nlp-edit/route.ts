import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { nlpEditMeal } from "@/lib/gemini";
import { calculateHealthRating } from "@/lib/health-rating";
import { nlpEditSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = nlpEditSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { mealId, instruction } = parsed.data;

  const meal = await prisma.meal.findFirst({
    where: { id: mealId, userId },
  });
  if (!meal) {
    return Response.json({ error: "Meal not found" }, { status: 404 });
  }

  try {
    const updates = await nlpEditMeal(meal, instruction);

    const updatedData = { ...meal, ...updates };
    const healthRating = calculateHealthRating(updatedData);

    const updatedMeal = await prisma.meal.update({
      where: { id: mealId },
      data: { ...updates, healthRating },
      include: { image: true },
    });

    return Response.json({ meal: updatedMeal, updates });
  } catch {
    return Response.json(
      { error: "Failed to process natural language edit" },
      { status: 500 }
    );
  }
}
