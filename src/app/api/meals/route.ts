import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { calculateHealthRating } from "@/lib/health-rating";

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
  const healthRating = calculateHealthRating(body);

  const meal = await prisma.meal.create({
    data: {
      userId,
      name: body.name,
      calories: body.calories,
      protein: body.protein,
      carbs: body.carbs,
      fat: body.fat,
      fiber: body.fiber ?? null,
      sugar: body.sugar ?? null,
      sodium: body.sodium ?? null,
      healthRating,
      mealType: body.mealType || "snack",
      eatenAt: body.eatenAt ? new Date(body.eatenAt) : new Date(),
      notes: body.notes ?? null,
      source: "web",
      imageId: body.imageId ?? null,
    },
    include: { image: true },
  });

  return Response.json({ meal });
}
