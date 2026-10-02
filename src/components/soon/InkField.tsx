"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { subscribePointer } from "@/lib/pointer";
import { startLiquidFlow } from "@/lib/liquid";
import { MD, prefersReducedMotion } from "@/lib/motion";
import { isNavActive } from "@/lib/navState";
import { isTouch } from "@/lib/tier";

/**
 * Rewrites a path as one moveto and cubic curves only — the form the liquid
 * engine (src/lib/liquid.ts) knows how to bend. Straight runs become curves
 * whose handles sit on the line, so the shape is unchanged until it moves.
 */
function toCubic(d: string): string {
  // absolute commands only (M L H V C Z) — every shape here is written that way
  const tokens = d.match(/[MLHVCZ]|-?\d*\.?\d+/g) ?? [];
  let i = 0;
  let x = 0;
  let y = 0;
  let out = "";
  const num = () => Number(tokens[i++]);
  const line = (nx: number, ny: number) => {
    out += `C${x} ${y} ${nx} ${ny} ${nx} ${ny}`;
    x = nx;
    y = ny;
  };
  let cmd = "";
  while (i < tokens.length) {
    if (/[A-Z]/.test(tokens[i])) cmd = tokens[i++];
    if (cmd === "M") {
      x = num();
      y = num();
      out += `M${x} ${y}`;
      cmd = "L";
    } else if (cmd === "L") line(num(), num());
    else if (cmd === "H") line(num(), y);
    else if (cmd === "V") line(x, num());
    else if (cmd === "C") {
      const a = [num(), num(), num(), num(), num(), num()];
      out += `C${a.join(" ")}`;
      x = a[4];
      y = a[5];
    } else break;
  }
  return out + "Z";
}

/**
 * One of the site's living fields, for the teaser: an ink mass with a lime
 * hairline riding just off its edge and a soft shadow under it, slowly
 * deforming like something thick and wet (the hero's liquid engine), leaning
 * with the cursor. Whatever's inside it — the night, the eyes, the moon — is
 * passed as children and sits on top.
 *
 * It bleeds past its own box on purpose, the way the hero's fields run off
 * the frame, so its moving edge is never a straight one.
 *
 * Built to be cheap to keep alive. The shadow is blurred once, in a layer of
 * its own, so the field reshaping above it never makes it blur again; the
 * field reshapes in a layer of its own too, so nothing around it repaints
 * with it. On a phone it doesn't lean with the tilt (every lean was a
 * repaint) and reshapes less often, and not while you scroll
 * (src/lib/liquid.ts).
 */
export default function InkField({
  ns,
  view,
  shape,
  className = "",
  tone = "ink",
  hairline = true,
  children,
}: {
  /** unique per field on the page: it names the shape the engine bends */
  ns: string;
  view: string;
  shape: string;
  className?: string;
  /** ink on the cream, or a lime splash behind a word */
  tone?: "ink" | "lime";
  hairline?: boolean;
  children?: React.ReactNode;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const shade = useRef<SVGSVGElement>(null);
  const d = toCubic(shape);

  useEffect(() => {
    const el = svg.current;
    if (!el || prefersReducedMotion()) return;
    const mobile = !window.matchMedia(MD).matches;
    let on = false;
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
    });
    io.observe(el);
    // leaning with the cursor: each layer at its own depth (the shadow least)
    let stop = () => {};
    if (!isTouch()) {
      const depths: Element[] = [...el.querySelectorAll("[data-depth]")];
      if (shade.current) depths.push(shade.current);
      const layers = depths.map((n) => ({
        x: gsap.quickTo(n, "x", { duration: 1.3, ease: "power2.out" }),
        y: gsap.quickTo(n, "y", { duration: 1.3, ease: "power2.out" }),
        depth: Number(n.getAttribute("data-depth")) || 10,
      }));
      stop = subscribePointer((nx, ny) => {
        if (!on || isNavActive()) return;
        for (const l of layers) {
          l.x(-nx * l.depth);
          l.y(-ny * l.depth * 0.62);
        }
      });
    }
    const stopLiquid = startLiquidFlow({
      svg: el,
      shapes: [d],
      ns,
      isMobile: mobile,
      paused: () => !on,
    });
    return () => {
      io.disconnect();
      stop();
      stopLiquid();
    };
  }, [d, ns]);

  const fill = tone === "lime" ? "var(--color-lime)" : "var(--color-ink)";
  return (
    <div className={`pointer-events-none absolute ${className}`}>
      {/* the shadow it casts on the cream: blurred once, in a layer of its own */}
      {tone === "ink" ? (
        <svg
          ref={shade}
          data-depth="6"
          viewBox={view}
          preserveAspectRatio="none"
          className="soon-ink-shade absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <filter id={`${ns}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={14} />
            </filter>
          </defs>
          <path d={d} fill="rgba(8, 8, 8, 0.24)" transform="translate(0 16)" filter={`url(#${ns}-shadow)`} />
        </svg>
      ) : null}
      <svg
        ref={svg}
        viewBox={view}
        preserveAspectRatio="none"
        className="soon-ink-live absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <path id={`${ns}-flow-0`} d={d} />
          <radialGradient id={`${ns}-wash`} cx="46%" cy="34%" r="62%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={tone === "lime" ? 0.25 : 0.075} />
            <stop offset="55%" stopColor="#ffffff" stopOpacity={tone === "lime" ? 0.06 : 0.022} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {hairline ? (
          <g data-depth="22">
            <use
              href={`#${ns}-flow-0`}
              fill="none"
              stroke={tone === "lime" ? "var(--color-ink)" : "var(--color-lime)"}
              strokeWidth={1.8}
              vectorEffect="non-scaling-stroke"
              transform="translate(-22 16)"
              opacity={tone === "lime" ? 0.5 : 0.85}
            />
          </g>
        ) : null}

        <g data-depth="10">
          <use href={`#${ns}-flow-0`} fill={fill} />
          <use href={`#${ns}-flow-0`} fill={`url(#${ns}-wash)`} />
        </g>
      </svg>
      {children}
    </div>
  );
}
