import "server-only";

/**
 * Supabase, over its REST endpoint — no client library, since the store asks
 * it three things and nothing else.
 *
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY come from the project's API
 * settings. The service role key goes past row level security, which is what
 * lets the site read and write tables nothing else can touch, so it belongs in
 * the server's environment only: never NEXT_PUBLIC_, never in the browser.
 *
 * Without them the store keeps teams in memory instead (store.ts), which is
 * fine on one machine and no good on a host that runs more than one.
 */
const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export const usingDatabase = Boolean(url && key);

async function ask(path: string, init?: RequestInit): Promise<unknown> {
  const answer = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key as string,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!answer.ok) {
    // the message, never the key: PostgREST answers with JSON that names what
    // it couldn't find, which is the useful half of a page full of markup
    const body = await answer.text();
    let said = body.slice(0, 200);
    try {
      const { message, hint } = JSON.parse(body) as { message?: string; hint?: string };
      if (message) said = hint ? `${message} (${hint})` : message;
    } catch {}
    throw new Error(`Supabase ${answer.status} on ${path.split("?")[0]}: ${said}`);
  }
  return answer.status === 204 ? null : answer.json();
}

/** One of the functions in db/schema.sql. */
export function run<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  return ask(`rpc/${fn}`, { method: "POST", body: JSON.stringify(args) }) as Promise<T>;
}

/** A read, written as PostgREST's query string. */
export function read<T>(query: string): Promise<T> {
  return ask(query) as Promise<T>;
}

/** One row, added. */
export async function write(table: string, row: Record<string, unknown>): Promise<void> {
  await ask(table, { method: "POST", body: JSON.stringify(row), headers: { Prefer: "return=minimal" } });
}

/** Whatever the query matches, changed. */
export async function patch(query: string, row: Record<string, unknown>): Promise<void> {
  await ask(query, { method: "PATCH", body: JSON.stringify(row), headers: { Prefer: "return=minimal" } });
}

/** Whatever the query matches, gone. */
export async function del(query: string): Promise<void> {
  await ask(query, { method: "DELETE", headers: { Prefer: "return=minimal" } });
}
