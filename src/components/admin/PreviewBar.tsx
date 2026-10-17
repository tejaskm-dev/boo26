"use client";

import { useEffect, useState } from "react";

/**
 * The preview's own pages, by the address each stands in for. A link to one
 * of these addresses is sent to its twin, so following the site around the
 * preview stays in the preview — the real ones are the teaser, or redirect
 * to it, until the site is live.
 */
const TWINS: Record<string, string> = {
  "/": "/admin/preview",
  "/terms": "/admin/preview/terms",
  "/code-of-conduct": "/admin/preview/code-of-conduct",
  "/privacy": "/admin/preview/privacy",
  "/register": "/admin/preview/register",
};

/**
 * Pinned to the corner of every preview page, for the core team: that this
 * isn't public, what decides when it is, and where the Register buttons go.
 * Tucked to a tab until it's opened, so it doesn't sit over the page.
 */
export default function PreviewBar({ live, register }: { live: boolean; register: string | null }) {
  const [open, setOpen] = useState(false);

  // Ahead of the page wipe's own listener (capture, on the way down), which
  // then follows whichever address the link has by the time it looks.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // the live site redirects /register to the outside page; here it opens
      // alongside, so the preview stays where it was
      if (register && (url.pathname === "/register" || url.pathname.startsWith("/register/"))) {
        a.href = register;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        return;
      }
      const twin = TWINS[url.pathname.replace(/\/$/, "") || "/"] ?? (url.pathname.startsWith("/register/") ? TWINS["/register"] : undefined);
      if (twin) a.href = `${twin}${url.search}${url.hash}`;
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [register]);

  const where = register ? new URL(register) : null;

  return (
    <aside
      aria-label="Preview"
      className="fixed bottom-[calc(clamp(0.75rem,2vh,1.25rem)+env(safe-area-inset-bottom))] left-[clamp(0.75rem,2vw,1.25rem)] z-[60] max-w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-bone/15 bg-ink/95 text-bone shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="label flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-left outline-none focus-visible:text-lime"
      >
        <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-lime" />
        <span>Preview</span>
        <span className="text-bone/45">{live ? "· live" : "· not public"}</span>
        <span aria-hidden="true" className={`ml-auto text-bone/50 transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          ⌃
        </span>
      </button>

      {open ? (
        <div className="space-y-3 border-t border-bone/12 px-4 pb-4 pt-3 text-[0.82rem] leading-snug text-bone/75">
          <p>
            {live
              ? "The full site is live: this is the same page visitors see."
              : "Only admins can see this. Visitors get the teaser until LIVE_STATUS is set to true and the site is redeployed."}
          </p>
          <p>
            <span className="text-bone/45">Register buttons: </span>
            {where ? (
              <a href={register!} target="_blank" rel="noopener noreferrer" className="break-all text-lime underline-offset-2 hover:underline">
                {where.host}
                {where.pathname === "/" ? "" : where.pathname}
              </a>
            ) : (
              <>not set yet — they show &ldquo;isn&rsquo;t open yet&rdquo; until REGISTER_URL is set.</>
            )}
          </p>
          <a
            href="/admin"
            className="label inline-flex items-center gap-2 text-bone outline-none transition-colors hover:text-lime focus-visible:text-lime"
          >
            <span aria-hidden="true">←</span> Dashboard
          </a>
        </div>
      ) : null}
    </aside>
  );
}
