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

  // If basic stats changed, recalculate targets
  let targetUpdates = {};
  if (body.weight || body.height || body.age || body.activityLevel || body.goal) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      targetUpdates = calculateTargets({
        name: user.name,
        age: body.age ?? user.age,
        gender: body.gender ?? user.gender,
        height: body.height ?? user.height,
        weight: body.weight ?? user.weight,
        activityLevel: body.activityLevel ?? user.activityLevel,
        goal: body.goal ?? user.goal,
      });
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { ...body, ...targetUpdates },
  });

  return Response.json({ user });
}
