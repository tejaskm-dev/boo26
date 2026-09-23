import "server-only";
import { cookies } from "next/headers";

/**
 * Who's looking at /admin.
 *
 * Google says who someone is (google.ts); this is what's kept afterwards — a
 * cookie holding their email and an expiry, signed with ADMIN_SESSION_SECRET
 * so it can't be written by anyone else. Nothing else is stored: no user
 * table, no server-side session list to go stale.
 *
 * The cookie's path is /admin, so it isn't sent with any request for the site
 * itself. Public pages stay exactly as fast, and as cacheable, as they were.
 */
const COOKIE = "boo_admin";
const PATH = "/admin";
const DAYS = 7;

const enc = new TextEncoder();

/** The emails allowed in, from ADMIN_EMAILS: "a@x.com, b@y.com". */
export function admins(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(/[,\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdmin(email: string | undefined | null): boolean {
  const who = email?.trim().toLowerCase();
  return !!who && admins().includes(who);
}

/** Everything the sign-in needs, set up and readable. Missing pieces are listed by name. */
export function missingSetup(): string[] {
  const missing: string[] = [];
  if (!process.env.GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
  if (!process.env.GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET");
  if (!process.env.ADMIN_SESSION_SECRET) missing.push("ADMIN_SESSION_SECRET");
  if (!admins().length) missing.push("ADMIN_EMAILS");
  return missing;
}

const b64url = (bytes: ArrayBuffer | Uint8Array) =>
  Buffer.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)).toString("base64url");

async function key(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

async function sign(body: string): Promise<string> {
  return b64url(await crypto.subtle.sign("HMAC", await key(), enc.encode(body)));
}

/** Signs this person in for a week. */
export async function startSession(email: string) {
  const body = b64url(enc.encode(JSON.stringify({ email: email.toLowerCase(), until: Date.now() + DAYS * 864e5 })));
  const jar = await cookies();
  jar.set(COOKIE, `${body}.${await sign(body)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: PATH,
    maxAge: DAYS * 86400,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete({ name: COOKIE, path: PATH });
}

/**
 * The signed-in admin, or null. The signature is checked with the crypto
 * itself rather than by comparing strings, so a wrong one can't be narrowed
 * down by how long the answer took — and being on the list is checked again
 * here, so dropping someone from ADMIN_EMAILS shuts them out at once, cookie
 * or no cookie.
 */
export async function currentAdmin(): Promise<string | null> {
  if (missingSetup().length) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  const [body, mac] = raw?.split(".") ?? [];
  if (!body || !mac) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(), Buffer.from(mac, "base64url"), enc.encode(body));
    if (!ok) return null;
    const { email, until } = JSON.parse(Buffer.from(body, "base64url").toString()) as { email: string; until: number };
    if (!(until > Date.now()) || !isAdmin(email)) return null;
    return email;
  } catch {
    // anything unreadable is simply not a session
    return null;
  }
}
