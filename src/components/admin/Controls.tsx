"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addressFor, GROUPS, SEATS_SHOWN, SORTS, type Params } from "@/lib/admin/view";

/**
 * Searching, ordering and grouping — all of which take effect the moment
 * they're changed. There's no Apply button because there's nothing to apply:
 * each control writes itself into the address and the page comes back sorted.
 *
 * The typing waits for a pause before it does that, so a search doesn't ask
 * the server once per keystroke.
 */

const field =
  "body-copy mt-1.5 w-full border-b border-bone/20 bg-ink pb-1.5 text-[0.95rem] text-bone outline-none transition-colors [color-scheme:dark] focus:border-lime";

export default function Controls({ params, grouped }: { params: Params; grouped: boolean }) {
  const router = useRouter();
  const [typed, setTyped] = useState(params.q);
  const typing = useRef(false);

  const go = (change: Partial<Params>) => router.push(addressFor({ ...params, ...change }), { scroll: false });

  // the search, once the typing stops
  useEffect(() => {
    if (!typing.current || typed === params.q) return;
    const waiting = window.setTimeout(() => {
      typing.current = false;
      router.push(addressFor({ ...params, q: typed }), { scroll: false });
    }, 350);
    return () => window.clearTimeout(waiting);
  }, [typed, params, router]);

  /** every group at once, which is why this one control isn't in the address */
  const fold = (open: boolean) => {
    for (const group of document.querySelectorAll<HTMLDetailsElement>("details[data-group]")) group.open = open;
  };

  return (
    <div className="mt-5 grid gap-x-6 gap-y-4 border-y border-bone/12 py-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.8fr))_auto]">
      <label className="block">
        <span className="label block text-[0.66rem] text-bone/40">Search</span>
        <input
          type="search"
          value={typed}
          onChange={(e) => {
            typing.current = true;
            setTyped(e.target.value);
          }}
          size={1}
          placeholder="name, email, number, code, department, note…"
          className="body-copy mt-1.5 w-full border-b border-bone/20 bg-transparent pb-1.5 text-[0.95rem] text-bone caret-lime outline-none transition-colors placeholder:text-bone/20 focus:border-lime"
        />
      </label>

      {[
        { label: "Seats", name: "seats" as const, options: SEATS_SHOWN },
        { label: "Order by", name: "sort" as const, options: SORTS },
        { label: "Group by", name: "group" as const, options: GROUPS },
      ].map((control) => (
        <label key={control.name} className="block">
          <span className="label block text-[0.66rem] text-bone/40">{control.label}</span>
          <select
            value={params[control.name]}
            onChange={(e) => go({ [control.name]: e.target.value })}
            className={field}
          >
            {control.options.map((o) => (
              <option key={o.value} value={o.value} className="bg-ink text-bone">
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      {grouped ? (
        <div className="flex items-end gap-4 self-end">
          {[
            { label: "Expand all", open: true },
            { label: "Collapse all", open: false },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => fold(b.open)}
              className="label cursor-pointer pb-1.5 text-[0.66rem] text-bone/45 underline decoration-bone/20 underline-offset-4 transition-colors hover:text-lime hover:decoration-lime"
            >
              {b.label}
            </button>
          ))}
        </div>
      ) : (
        <span className="hidden lg:block" />
      )}
    </div>
  );
}
