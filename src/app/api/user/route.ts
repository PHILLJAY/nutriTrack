import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { calculateTargets } from "@/lib/nutrition";
import { userUpdateSchema } from "@/lib/validations";

export async function GET() {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json({ user });
}

export async function PATCH(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updates = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined)
  );

  // If basic stats or macro ratios changed, recalculate targets
  const needsRecalc =
    updates.weight || updates.height || updates.age || updates.activityLevel || updates.goal ||
    updates.targetProteinPct !== undefined || updates.targetCarbsPct !== undefined || updates.targetFatPct !== undefined;

  let targetUpdates = {};
  if (needsRecalc) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const customRatios = {
        proteinPct: (updates.targetProteinPct as number) ?? user.targetProteinPct,
        carbsPct: (updates.targetCarbsPct as number) ?? user.targetCarbsPct,
        fatPct: (updates.targetFatPct as number) ?? user.targetFatPct,
      };
      targetUpdates = calculateTargets(
        {
          name: user.name,
          age: (updates.age as number) ?? user.age,
          gender: (updates.gender as string) ?? user.gender,
          height: (updates.height as number) ?? user.height,
          weight: (updates.weight as number) ?? user.weight,
          activityLevel: (updates.activityLevel as string) ?? user.activityLevel,
          goal: (updates.goal as string) ?? user.goal,
        },
        customRatios
      );
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { ...updates, ...targetUpdates },
  });

  return Response.json({ user });
}
