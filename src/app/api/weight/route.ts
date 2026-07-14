import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { format } from "date-fns";
import { z } from "zod";

const schema = z.object({
  weight: z.number().min(20).max(500),
  date: z.string().optional(),
  notes: z.string().max(200).optional(),
});

export async function GET(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "90");

  const entries = await prisma.weightEntry.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: limit,
  });

  return Response.json({ entries: entries.reverse() });
}

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { weight, date: dateStr, notes } = parsed.data;
  const date = dateStr || format(new Date(), "yyyy-MM-dd");

  const entry = await prisma.weightEntry.upsert({
    where: {
      id: (await prisma.weightEntry.findFirst({ where: { userId, date } }))?.id || "__none__",
    },
    update: { weight, notes },
    create: { userId, weight, date, notes },
  });

  // Also update the user's current weight
  await prisma.user.update({
    where: { id: userId },
    data: { weight },
  });

  return Response.json({ entry });
}
