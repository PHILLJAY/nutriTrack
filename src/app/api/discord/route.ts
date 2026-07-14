import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { discordId } = await request.json();
  if (!discordId) {
    return Response.json({ error: "discordId required" }, { status: 400 });
  }

  // Check if this discord ID is already linked to another user
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
