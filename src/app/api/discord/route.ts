import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { discordLinkSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = discordLinkSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { discordId } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { discordId },
  });
  if (existing && existing.id !== userId) {
    return Response.json(
      { error: "This Discord account is already linked to another user" },
      { status: 409 }
    );
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { discordId },
  });

  return Response.json({ user });
}
