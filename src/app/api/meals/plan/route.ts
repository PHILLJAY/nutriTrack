import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateMealPlan } from "@/lib/gemini";
import { z } from "zod";

const planSchema = z.object({
  days: z.number().int().min(1).max(7),
});

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = planSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const { days } = parsed.data;

  try {
    const plan = await generateMealPlan({
      calories: user.targetCalories,
      protein: user.targetProtein,
      carbs: user.targetCarbs,
      fat: user.targetFat,
      goal: user.goal,
    }, days);

    return Response.json({ plan });
  } catch {
    return Response.json(
      { error: "Failed to generate meal plan" },
      { status: 500 }
    );
  }
}
