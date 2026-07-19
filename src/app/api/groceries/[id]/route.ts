import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const list = await prisma.groceryList.findFirst({ where: { id, userId } });
  if (!list) {
    return Response.json({ error: "List not found" }, { status: 404 });
  }

  const body = await request.json();

  if (body.itemId !== undefined && body.checked !== undefined) {
    const item = await prisma.groceryItem.findFirst({
      where: { id: body.itemId, listId: id },
    });
    if (!item) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }
    const updated = await prisma.groceryItem.update({
      where: { id: body.itemId },
      data: { checked: body.checked },
    });
    return Response.json({ item: updated });
  }

  if (body.name) {
    const item = await prisma.groceryItem.create({
      data: {
        listId: id,
        name: body.name,
        quantity: body.quantity || null,
        unit: body.unit || null,
      },
    });
    return Response.json({ item });
  }

  return Response.json({ error: "Invalid request" }, { status: 400 });
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
  const list = await prisma.groceryList.findFirst({ where: { id, userId } });
  if (!list) {
    return Response.json({ error: "List not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const itemId = url.searchParams.get("itemId");
  if (itemId) {
    await prisma.groceryItem.delete({ where: { id: itemId } });
    return Response.json({ success: true });
  }

  await prisma.groceryList.delete({ where: { id } });
  return Response.json({ success: true });
}
