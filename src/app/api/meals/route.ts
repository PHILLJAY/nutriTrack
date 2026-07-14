import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { calculateHealthRating } from "@/lib/health-rating";
import { mealCreateSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  const where: Record<string, unknown> = { userId };
  if (startDate && endDate) {
    where.eatenAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const meals = await prisma.meal.findMany({
    where,
    include: { image: true },
    orderBy: { eatenAt: "asc" },
  });

  return Response.json({ meals });
}

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = mealCreateSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const healthRating = calculateHealthRating(data);

  const meal = await prisma.meal.create({
    data: {
      userId,
      name: data.name,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber ?? null,
      sugar: data.sugar ?? null,
      sodium: data.sodium ?? null,
      healthRating,
      mealType: data.mealType || "snack",
      eatenAt: data.eatenAt ? new Date(data.eatenAt) : new Date(),
      notes: data.notes ?? null,
      source: "web",
      imageId: data.imageId ?? null,
    },
    include: { image: true },
  });

  return Response.json({ meal });
}
