import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { setSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = body.name?.trim();

  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const users = await prisma.user.findMany({
    where: { name },
  });

  const user = users.find(
    (u) => u.name.toLowerCase() === name.toLowerCase()
  ) || null;

  if (!user) {
    return Response.json(
      { error: "No account found with that name" },
      { status: 404 }
    );
  }

  await setSession(user.id);

  return Response.json({ user });
}