import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { calculateTargets } from "@/lib/nutrition";

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

  // Whitelist allowed fields to prevent mass assignment
  const allowedFields = [
    "name", "age", "gender", "height", "weight",
    "activityLevel", "goal",
  ] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key];
  }

  // If basic stats changed, recalculate targets
  let targetUpdates = {};
  if (updates.weight || updates.height || updates.age || updates.activityLevel || updates.goal) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      targetUpdates = calculateTargets({
        name: user.name,
        age: (updates.age as number) ?? user.age,
        gender: (updates.gender as string) ?? user.gender,
        height: (updates.height as number) ?? user.height,
        weight: (updates.weight as number) ?? user.weight,
        activityLevel: (updates.activityLevel as string) ?? user.activityLevel,
        goal: (updates.goal as string) ?? user.goal,
      });
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { ...updates, ...targetUpdates },
  });

  return Response.json({ user });
}
