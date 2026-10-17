"use client";

import { useEffect, useRef } from "react";
import Sprite from "@/components/ui/Sprite";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A spider on a thread. It drops in from above once its section comes into
 * view, bounces at the end of its line and hangs there, turning a little.
 * Touch it, or point at it, and it goes straight back up — and, a moment
 * later, comes down again. Its note is on its body (Notes.tsx).
 *
 * Without the script, or with motion turned down, it's simply hanging there.
 */
export default function Spider({ note, className = "", drop = "clamp(5rem, 12vh, 8rem)" }: { note: string; className?: string; /** how far it hangs below its anchor */ drop?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.dataset.on = "true";
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.on = "true";
        io.disconnect();
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(el);
    let back = 0;
    const startle = () => {
      if (el.dataset.up) return;
      el.dataset.up = "true";
      window.clearTimeout(back);
      back = window.setTimeout(() => delete el.dataset.up, 1600);
    };
    const body = el.querySelector<HTMLElement>("[data-body]");
    body?.addEventListener("pointerenter", startle);
    body?.addEventListener("pointerdown", startle);
    return () => {
      io.disconnect();
      window.clearTimeout(back);
      body?.removeEventListener("pointerenter", startle);
      body?.removeEventListener("pointerdown", startle);
    };
  }, []);

  return (
    <div ref={root} className={`fx-spider pointer-events-none absolute ${className}`} data-on="false" style={{ "--drop": drop } as React.CSSProperties} aria-hidden="true">
      <span className="fx-spider-line" />
      <span className="fx-spider-body soon-loop">
        <Sprite name="spider" scale={0.62} data-body="" data-note={note} style={{ pointerEvents: "auto" }} />
      </span>
    </div>
  );
}
