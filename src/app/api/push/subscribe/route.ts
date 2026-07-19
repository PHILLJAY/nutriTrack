import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint, keys } = body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return Response.json({ error: "Invalid subscription" }, { status: 400 });
  }

  // Remove old subscription for this endpoint (dedup)
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });

  await prisma.pushSubscription.create({
    data: {
      userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  return Response.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint } = body;

  if (endpoint) {
    await prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
  }

  return Response.json({ success: true });
}
