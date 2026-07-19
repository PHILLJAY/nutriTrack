import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import webpush from "web-push";

const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@nutritrack.app";
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!vapidPublicKey || !vapidPrivateKey) {
    return Response.json({ error: "VAPID keys not configured" }, { status: 500 });
  }

  const body = await request.json();
  const { title, body: pushBody, url } = body;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({ title: title || "NutriTrack", body: pushBody || "", url: url || "/dashboard" })
      ).catch(() => {
        // Remove dead subscriptions
        prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return Response.json({ sent, total: subscriptions.length });
}
