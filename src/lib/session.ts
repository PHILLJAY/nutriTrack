import { cookies } from "next/headers";

const SESSION_COOKIE = "nutritrack_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "nutritrack-dev-secret-change-me";

async function getKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(value: string): Promise<string> {
  const key = await getKey();
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  const hashArray = Array.from(new Uint8Array(signature));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${value}.${hash}`;
}

async function verify(signed: string): Promise<string | null> {
  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;
  const value = signed.substring(0, lastDot);
  const expected = await sign(value);
  if (signed === expected) return value;
  return null;
}

export async function setSession(userId: string) {
  const cookieStore = await cookies();
  const signed = await sign(userId);
  cookieStore.set(SESSION_COOKIE, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const signed = cookieStore.get(SESSION_COOKIE)?.value;
  if (!signed) return null;
  return verify(signed);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
