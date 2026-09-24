"use client";

import { useEffect, useState } from "react";
import { cleanId, looksLikeId } from "@/lib/register/fields";

/**
 * Asks, while somebody is still typing, whether their college ID is already
 * registered — so they hear it on the field rather than after filling in the
 * rest and sending it.
 *
 * It waits for a pause in the typing and keeps the answer next to the ID it
 * was asked about, so an answer that arrives late can't be shown against a
 * different ID. If the check can't be reached it says nothing: the sign-up
 * itself still refuses a registered ID when the form is sent, so this is only
 * ever early warning, never the thing standing in the way.
 */
export function useTakenId(raw: string): string | null {
  const [answer, setAnswer] = useState<{ id: string; taken: boolean } | null>(null);
  const id = cleanId(raw);

  useEffect(() => {
    if (!looksLikeId(id)) return;

    const stop = new AbortController();
    const asking = window.setTimeout(async () => {
      try {
        const said = await fetch(`/api/registered?id=${encodeURIComponent(id)}`, { signal: stop.signal });
        const { taken } = (await said.json()) as { taken?: boolean };
        setAnswer({ id, taken: Boolean(taken) });
      } catch {
        // offline, or overtaken by the next keystroke
      }
    }, 400);

    return () => {
      window.clearTimeout(asking);
      stop.abort();
    };
  }, [id]);

  return answer && answer.id === id && answer.taken ? "This ID is already registered." : null;
}
