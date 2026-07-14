import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { format } from "date-fns";
import { z } from "zod";

const schema = z.object({
  glasses: z.number().int().min(0).max(50),
  date: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || format(new Date(), "yyyy-MM-dd");

  const entry = await prisma.waterEntry.findFirst({
    where: { userId, date },
  });

  return Response.json({ glasses: entry?.glasses || 0 });
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

  const { glasses, date: dateStr } = parsed.data;
  const date = dateStr || format(new Date(), "yyyy-MM-dd");

  const entry = await prisma.waterEntry.upsert({
    where: {
      id: (await prisma.waterEntry.findFirst({ where: { userId, date } }))?.id || "__none__",
    },
    update: { glasses },
    create: { userId, glasses, date },
  });

  return Response.json({ glasses: entry.glasses });
}
