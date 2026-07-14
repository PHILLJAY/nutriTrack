import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { calculateHealthRating } from "@/lib/health-rating";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Verify meal belongs to user
  const existing = await prisma.meal.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return Response.json({ error: "Meal not found" }, { status: 404 });
  }

  // Recalculate health rating if nutrition changed
  const updatedData = { ...existing, ...body };
  const healthRating =
    body.calories || body.protein || body.carbs || body.fat
      ? calculateHealthRating(updatedData)
      : existing.healthRating;

  const meal = await prisma.meal.update({
    where: { id },
    data: {
      ...body,
      healthRating,
      eatenAt: body.eatenAt ? new Date(body.eatenAt) : undefined,
    },
    include: { image: true },
  });

  return Response.json({ meal });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.meal.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return Response.json({ error: "Meal not found" }, { status: 404 });
  }

  await prisma.meal.delete({ where: { id } });

  return Response.json({ success: true });
}
