import "server-only";

/**
 * Signing in with Google, the ordinary way round: we send the admin to
 * Google, Google sends them back with a one-time code, and the server trades
 * that code for the identity — over TLS, straight from Google's token
 * endpoint, with the client secret. The browser never handles a token.
 *
 * A random `state` goes out with them and comes back, and is compared with
 * the copy kept in a short-lived cookie: that's what stops someone else's
 * callback being replayed at us.
 */
const AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN = "https://oauth2.googleapis.com/token";

export const STATE_COOKIE = "boo_admin_state";

export function newState(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString("base64url");
}

export function signInUrl(redirect: string, state: string): string {
  const url = new URL(AUTH);
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email");
  url.searchParams.set("state", state);
  // always offer the account picker: these are shared laptops on the night
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

/** The verified email behind a callback code, or null if Google won't vouch for it. */
export async function emailFromCode(code: string, redirect: string): Promise<string | null> {
  const answer = await fetch(TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    cache: "no-store",
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirect,
      grant_type: "authorization_code",
    }),
  });
  if (!answer.ok) return null;

  const { id_token } = (await answer.json()) as { id_token?: string };
  const payload = id_token?.split(".")[1];
  if (!payload) return null;

  // The token came from Google's own endpoint over TLS, so its signature has
  // already done its job in transit; what's needed here is what's inside.
  const claims = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
    email?: string;
    email_verified?: boolean | string;
    aud?: string;
  };
  if (claims.aud !== process.env.GOOGLE_CLIENT_ID) return null;
  if (claims.email_verified === false || claims.email_verified === "false") return null;
  return claims.email?.toLowerCase() ?? null;
}
