"use client";

import { useMemo, useState } from "react";
import {
  DEFAULTS,
  FIELDS,
  headings,
  queryFrom,
  rowsFor,
  type ExportOptions,
} from "@/lib/admin/csv";
import { pick, queryFor, type Params } from "@/lib/admin/view";
import type { TeamRecord } from "@/lib/register/teams";

/**
 * What the spreadsheet should be, decided with it in front of you.
 *
 * Every choice redraws the first few rows straight away — the preview is
 * built by the same code that writes the file, so there's no guessing what
 * "one row per team" or "a number for WhatsApp" is going to do to it once
 * it's open in Excel.
 */

const GROUPS = [
  { of: "team" as const, title: "About the team" },
  { of: "person" as const, title: "About each person" },
];

const CHOICES = [
  {
    key: "rows" as const,
    label: "A row is",
    options: [
      { value: "person", label: "One person", hint: "each team appears twice" },
      { value: "team", label: "One team", hint: "both people side by side" },
    ],
  },
  {
    key: "phone" as const,
    label: "Numbers",
    options: [
      { value: "country", label: "919895012345", hint: "what WhatsApp wants" },
      { value: "plain", label: "9895012345", hint: "ten digits" },
      { value: "pretty", label: "+91 98950 12345", hint: "to read" },
    ],
  },
  {
    key: "dates" as const,
    label: "Dates",
    options: [
      { value: "readable", label: "24 Sept 2026, 7:12 pm" },
      { value: "date", label: "2026-09-24", hint: "sorts as text" },
      { value: "iso", label: "Exact, with the time zone" },
    ],
  },
  {
    key: "heading", 
    label: "First row",
    options: [
      { value: "human", label: "Names to read" },
      { value: "machine", label: "team_code, college_id…", hint: "for another program" },
      { value: "none", label: "No heading" },
    ],
  },
  {
    key: "sep" as const,
    label: "Separated by",
    options: [
      { value: ",", label: "Commas", hint: ".csv" },
      { value: "\t", label: "Tabs", hint: ".tsv — paste straight into a sheet" },
      { value: ";", label: "Semicolons", hint: "Excel in some countries" },
    ],
  },
] as const;

export default function ExportSetup({
  teams,
  params,
  origin,
}: {
  teams: TeamRecord[];
  params: Params;
  origin: string;
}) {
  const [options, setOptions] = useState<ExportOptions>(DEFAULTS);
  const [everything, setEverything] = useState(false);

  const filtered = useMemo(() => pick(teams, params), [teams, params]);
  const narrowed = filtered.length !== teams.length;
  const wanted = everything || !narrowed ? teams : filtered;

  const set = (change: Partial<ExportOptions>) => setOptions((was) => ({ ...was, ...change }));

  const toggle = (key: string) =>
    set({
      fields: options.fields.includes(key)
        ? options.fields.filter((f) => f !== key)
        : // added in the order the catalogue has them, so columns stay sensible
          FIELDS.filter((f) => f.key === key || options.fields.includes(f.key)).map((f) => f.key),
    });

  const columns = headings(options);
  const preview = useMemo(() => rowsFor(wanted.slice(0, 4), options, origin), [wanted, options, origin]);

  const download = useMemo(() => {
    const parts = [queryFrom(options), everything || !narrowed ? "all=1" : queryFor(params)].filter(Boolean);
    return `/admin/export/csv${parts.length ? `?${parts.join("&")}` : ""}`;
  }, [options, everything, narrowed, params]);

  const people = wanted.reduce((n, t) => n + t.members.length, 0);

  return (
    <div className="mx-auto max-w-[72rem]">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div>
          <h1 className="figure text-[clamp(1.6rem,3.4vw,2.2rem)]">Export</h1>
          <p className="muted mt-1.5 text-[0.88rem]">
            {options.rows === "person"
              ? `${people} rows — one per person, across ${wanted.length} teams.`
              : `${wanted.length} rows — one per team, ${people} people in all.`}
          </p>
        </div>
        <a href={download} className="btn btn-go py-2.5 text-[0.9rem]" download>
          Download {options.sep === "\t" ? ".tsv" : ".csv"}
        </a>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div className="space-y-3">
          {narrowed ? (
            <section className="card p-4">
              <p className="eyebrow mb-3">Which teams</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setEverything(false)} aria-pressed={!everything} className="toggle">
                  The ones you filtered <span className="count">{filtered.length}</span>
                </button>
                <button type="button" onClick={() => setEverything(true)} aria-pressed={everything} className="toggle">
                  Everything <span className="count">{teams.length}</span>
                </button>
              </div>
            </section>
          ) : null}

          <section className="card p-4">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
              <p className="eyebrow">Columns</p>
              <span className="faint text-[0.78rem]">{options.fields.length} chosen</span>
            </div>

            {GROUPS.map((group) => (
              <div key={group.of} className="mt-3 first:mt-0">
                <p className="faint mb-2 text-[0.78rem]">{group.title}</p>
                <div className="flex flex-wrap gap-2">
                  {FIELDS.filter((f) => f.of === group.of).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => toggle(f.key)}
                      aria-pressed={options.fields.includes(f.key)}
                      className="toggle"
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-4 flex flex-wrap gap-3 border-t border-[var(--line)] pt-3">
              <button type="button" onClick={() => set({ fields: FIELDS.map((f) => f.key) })} className="btn btn-plain text-[0.8rem]">
                Everything
              </button>
              <button type="button" onClick={() => set({ fields: DEFAULTS.fields })} className="btn btn-plain text-[0.8rem]">
                The usual ten
              </button>
              <button type="button" onClick={() => set({ fields: [] })} className="btn btn-plain text-[0.8rem]">
                None
              </button>
            </div>
          </section>

          <section className="card p-4">
            <p className="eyebrow mb-3">How it&rsquo;s written</p>
            <div className="space-y-4">
              {CHOICES.map((choice) => (
                <div key={choice.key}>
                  <p className="faint mb-2 text-[0.78rem]">{choice.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {choice.options.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => set({ [choice.key]: o.value } as Partial<ExportOptions>)}
                        aria-pressed={options[choice.key as keyof ExportOptions] === o.value}
                        title={"hint" in o ? o.hint : undefined}
                        className="toggle"
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <p className="faint mb-2 text-[0.78rem]">For Excel</p>
                <button type="button" onClick={() => set({ bom: !options.bom })} aria-pressed={options.bom} className="toggle">
                  Mark the file as Unicode
                </button>
                <p className="faint mt-2 text-[0.76rem] leading-[1.5]">
                  Keeps names with accents readable when Excel opens it. Leave it on unless something refuses the file.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* what that adds up to */}
        <section className="card lg:sticky lg:top-20 lg:self-start">
          <header className="card-head">
            <h2 className="eyebrow">The first few rows</h2>
            <p className="faint text-[0.78rem]">{columns.length} columns</p>
          </header>
          <div className="overflow-x-auto">
            {options.fields.length ? (
              <table className="w-full border-collapse text-[0.78rem]">
                {options.heading !== "none" ? (
                  <thead>
                    <tr>
                      {columns.map((head, i) => (
                        <th
                          key={`${head}-${i}`}
                          className="border-b border-[var(--line)] bg-[var(--sunk)] px-3 py-2 text-left font-medium whitespace-nowrap"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                ) : null}
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i}>
                      {row.map((value, j) => (
                        <td key={j} className="muted border-b border-[var(--line)] px-3 py-2 whitespace-nowrap">
                          {value || <span className="faint">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {preview.length ? null : (
                    <tr>
                      <td className="muted px-3 py-8 text-center">Nothing to export.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <p className="muted px-4 py-10 text-center text-[0.86rem]">Pick a column or two.</p>
            )}
          </div>
          {wanted.length > preview.length ? (
            <p className="faint border-t border-[var(--line)] px-4 py-2.5 text-[0.78rem]">
              …and {options.rows === "person" ? people - preview.length : wanted.length - preview.length} more rows in the
              file.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
