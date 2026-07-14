import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { analyzeMealDescription } from "@/lib/gemini";
import { calculateHealthRating } from "@/lib/health-rating";
import { z } from "zod";

const schema = z.object({
  description: z.string().min(1).max(500),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
});

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { description, mealType } = parsed.data;

  try {
    const analysis = await analyzeMealDescription(description, mealType || "snack");
    const healthRating = calculateHealthRating(analysis);

    const meal = await prisma.meal.create({
      data: {
        userId,
        name: analysis.name,
        calories: analysis.calories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
        fiber: analysis.fiber,
        sugar: analysis.sugar,
        sodium: analysis.sodium,
        healthRating,
        mealType: analysis.mealType,
        eatenAt: new Date(),
        notes: analysis.notes,
        source: "web",
      },
      include: { image: true },
    });

    return Response.json({ meal, analysis });
  } catch {
    return Response.json(
      { error: "Failed to analyze meal description" },
      { status: 500 }
    );
  }
}
