import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { z } from "zod";

const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    sortOrder: z.number().int(),
  })),
});

export async function PATCH(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.items.map((item) =>
      prisma.meal.updateMany({
        where: { id: item.id, userId },
        data: { sortOrder: item.sortOrder },
      })
    )
  );

  return Response.json({ success: true });
}
