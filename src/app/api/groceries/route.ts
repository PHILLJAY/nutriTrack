import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const lists = await prisma.groceryList.findMany({
    where: { userId },
    include: { items: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ lists });
}

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { name, items } = body;

  if (!name || typeof name !== "string") {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const list = await prisma.groceryList.create({
    data: {
      userId,
      name,
      items: items?.length ? {
        create: items.map((item: { name: string; quantity?: string; unit?: string }) => ({
          name: item.name,
          quantity: item.quantity || null,
          unit: item.unit || null,
        })),
      } : undefined,
    },
    include: { items: true },
  });

  return Response.json({ list });
}
