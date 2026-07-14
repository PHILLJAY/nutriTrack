import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { z } from "zod";

const templateSchema = z.object({
  name: z.string().min(1).max(200),
  calories: z.number().int().min(0).max(10000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(500),
  fat: z.number().min(0).max(500),
  fiber: z.number().min(0).max(200).nullable().optional(),
  sugar: z.number().min(0).max(500).nullable().optional(),
  sodium: z.number().min(0).max(50000).nullable().optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  notes: z.string().max(500).nullable().optional(),
});

export async function GET() {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const templates = await prisma.mealTemplate.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json({ templates });
}

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = templateSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const template = await prisma.mealTemplate.create({
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
      mealType: data.mealType || "snack",
      notes: data.notes ?? null,
    },
  });

  return Response.json({ template });
}
