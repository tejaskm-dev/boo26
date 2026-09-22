"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * A sign-up's steps, kept in the browser's history. The back button — a
 * phone's above all — then goes back a step, rather than out of the form and
 * away from everything typed into it.
 *
 * The step rides in the query (?step=campus), so each one is its own address.
 * What was typed isn't kept anywhere, so arriving on a later step directly —
 * a reload, a shared link — starts again from the first.
 */
export function useSteps(keys: readonly string[]) {
  const router = useRouter();
  const pathname = usePathname();
  const [at, setAt] = useState(0);
  /** the furthest step reached; the history can't take anyone past it */
  const reached = useRef(0);
  /** the steps behind each history entry this form has pushed, in order */
  const trail = useRef<number[]>([0]);

  // arriving on a later step: back to the first, in the address too
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("step")) router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  useEffect(() => {
    const onPop = () => {
      const key = new URL(window.location.href).searchParams.get("step") ?? keys[0];
      const i = Math.min(Math.max(0, keys.indexOf(key)), reached.current);
      const last = trail.current.lastIndexOf(i);
      trail.current = last >= 0 ? trail.current.slice(0, last + 1) : [i];
      setAt(i);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [keys]);

  const go = useCallback(
    (i: number) => {
      reached.current = Math.max(reached.current, i);
      trail.current.push(i);
      setAt(i);
      const url = new URL(window.location.href);
      if (i === 0) url.searchParams.delete("step");
      else url.searchParams.set("step", keys[i]);
      window.history.pushState(null, "", url);
    },
    [keys],
  );

  /** a step back: through the history when the last entry is that step, so the two backs agree */
  const back = useCallback(() => {
    const t = trail.current;
    if (t.length > 1 && t[t.length - 2] === t[t.length - 1] - 1) window.history.back();
    else go(Math.max(0, t[t.length - 1] - 1));
  }, [go]);

  return { at, go, back };
}
