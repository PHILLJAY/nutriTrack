import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.mealTemplate.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return Response.json({ error: "Template not found" }, { status: 404 });
  }

  await prisma.mealTemplate.delete({ where: { id } });

  return Response.json({ success: true });
}
