import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { analyzeMealDescription } from "@/lib/gemini";
import { calculateHealthRating } from "@/lib/health-rating";
import { checkRateLimit } from "@/lib/rate-limit";
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

  const { allowed, retryAfter } = checkRateLimit(userId, "meals/analyze-text");
  if (!allowed) {
    return Response.json(
      { error: `Rate limit exceeded. Try again in ${retryAfter}s` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
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
        vitaminA: analysis.vitaminA_mcg ?? null,
        vitaminC: analysis.vitaminC_mg ?? null,
        vitaminD: analysis.vitaminD_mcg ?? null,
        calcium: analysis.calcium_mg ?? null,
        iron: analysis.iron_mg ?? null,
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
