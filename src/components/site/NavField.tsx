"use client";

import { NAV_FIELD } from "@/lib/shapes";

/** The black fields behind the menu, traced from the supplied nav comp. */
export function NavBase({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={NAV_FIELD.viewBox}
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      <path
        d={NAV_FIELD.shapes[0]}
        fill="none"
        stroke="var(--color-lime)"
        strokeWidth={1.8}
        transform="translate(-40 22)"
        opacity={0.85}
      />
      <g className="field-lift">
        <path d={NAV_FIELD.shapes[0]} fill="var(--color-ink)" />
        <path d={NAV_FIELD.shapes[1]} fill="var(--color-ink)" />
      </g>
      <path
        d="M-60 372C120 300 168 452 300 470C432 488 470 392 560 392"
        fill="none"
        stroke="var(--color-lime)"
        strokeWidth={1.6}
        strokeLinecap="round"
        opacity={0.7}
      />
    </svg>
  );
}

/**
 * The ledge the cat leans over. Drawn above the cat so it crops the artwork —
 * the same trick the reference comp uses.
 */
export function NavLedge({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      <path
        className="field-lift"
        d="M820 610C900 500 980 486 1070 470C1170 452 1230 498 1330 536C1430 574 1530 552 1680 506L1680 980L820 980Z"
        fill="var(--color-ink)"
      />
      <path
        d="M820 610C900 500 980 486 1070 470C1170 452 1230 498 1330 536C1430 574 1530 552 1680 506"
        fill="none"
        stroke="var(--color-lime)"
        strokeWidth={1.6}
        opacity={0.5}
        transform="translate(0 -14)"
      />
    </svg>
  );
}
