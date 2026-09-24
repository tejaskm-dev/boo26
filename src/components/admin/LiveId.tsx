"use client";

import { useEffect, useState } from "react";
import { cleanId, looksLikeId } from "@/lib/register/fields";

/**
 * The college ID field, which says whose it is before the form is sent.
 *
 * The database would refuse a duplicate anyway, but only after the whole form
 * goes — and then all it can say is that it's taken. Asking as it's typed
 * means the answer can be useful: the name and the team it's already under,
 * which is usually the thing you actually wanted to know.
 */
export default function LiveId({
  code,
  seat,
  defaultValue,
}: {
  code: string;
  seat: number;
  defaultValue: string;
}) {
  const [typed, setTyped] = useState(defaultValue);
  const [answer, setAnswer] = useState<{ id: string; said: string } | null>(null);
  const id = cleanId(typed);

  useEffect(() => {
    if (!looksLikeId(id)) return;

    const stop = new AbortController();
    const asking = window.setTimeout(async () => {
      try {
        const query = new URLSearchParams({ id, code, seat: String(seat) });
        const answered = await fetch(`/admin/lookup?${query}`, { signal: stop.signal });
        const held = (await answered.json()) as { taken?: boolean; name?: string; team?: string };
        setAnswer({
          id,
          said: held.taken ? `This ID already exists under ${held.name} in team ${held.team}.` : "",
        });
      } catch {
        // overtaken, or nothing answering: the save still checks
      }
    }, 400);

    return () => {
      window.clearTimeout(asking);
      stop.abort();
    };
  }, [id, code, seat]);

  const said = answer && answer.id === id ? answer.said : "";

  return (
    <label className="block">
      <span className="label block text-[0.68rem] text-bone/40">College ID</span>
      <input
        name="collegeId"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        required
        maxLength={24}
        size={1}
        className={`body-copy mt-1.5 w-full border-b bg-transparent pb-1.5 text-[0.95rem] text-bone caret-lime outline-none transition-colors focus:border-lime ${
          said ? "border-lime/60" : "border-bone/20"
        }`}
      />
      {said ? <span className="body-copy mt-2 block text-[0.82rem] leading-[1.5] text-lime">{said}</span> : null}
    </label>
  );
}
