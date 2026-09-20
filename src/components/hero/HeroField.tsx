"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { subscribePointer } from "@/lib/pointer";
import { HERO_FIELD, MOBILE_FIELD } from "@/lib/shapes";
import { prefersReducedMotion } from "@/lib/motion";
import { startLiquidFlow } from "@/lib/liquid";

/**
 * The hero's environment. Black fields traced off the supplied comps
 * (scripts/trace-shapes.py), bled past the frame so they always run off the
 * edges, with the lime hairlines that shadow their boundaries and the eyes that
 * watch out of them. Every layer drifts a different amount with the pointer —
 * that, plus the shadow each field casts onto the off-white, is where the depth
 * comes from. There is no image behind any of this.
 *
 * Beneath the pointer parallax sits an organic liquid flow engine: the ink and
 * lime boundaries slowly and continuously deform like thick, viscous liquid,
 * gently reacting to mouse inertia and scroll velocity without distorting the
 * foreground assets.
 */
export default function HeroField({ className = "" }: { className?: string }) {
  return (
    <>
      <MobileField className={`md:hidden ${className}`} />
      <DesktopField className={`hidden md:block ${className}`} />
    </>
  );
}

/**
 * Shared defs: the glow the eyes sit in, the wash/rim gradients, and the
 * multi-speed SVG liquid deformation filters (background, midground, and
 * foreground contour flow).
 */
function FieldDefs({ ns, isMobile = false }: { ns: string; isMobile?: boolean }) {
  // 4.5 in mobile 390x800 viewBox equals 15 in desktop 1600x900 viewBox
  const shadowStd = isMobile ? 4.5 : 15;
  return (
    <defs>
      <filter id={`${ns}-glow`} x="-70%" y="-90%" width="240%" height="280%">
        <feGaussianBlur stdDeviation="6" result="soft" />
        <feMerge>
          <feMergeNode in="soft" />
          <feMergeNode in="soft" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* GPU-cached static shadow filter — calculated once on load, never re-blurred per frame */}
      <filter id={`${ns}-shadow-blur`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation={shadowStd} />
      </filter>
      <radialGradient id={`${ns}-wash`} cx="46%" cy="34%" r="62%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.075" />
        <stop offset="55%" stopColor="#ffffff" stopOpacity="0.022" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${ns}-rim`} x1="0" y1="0" x2="0.25" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
        <stop offset="45%" stopColor="#ffffff" stopOpacity="0.04" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

/** Narrowed cat eyes, drawn in a 134x68 box — the motif from the comps. */
const EYES = [
  "M7 5 57 47C45 63 19 61 9 47 2 38 4 15 7 5Z",
  "M127 27 77 63C87 79 113 77 123 63 130 54 129 37 127 27Z",
];

/** Eyes drawn straight into the field, so they travel with the composition. */
function Eyes({
  x,
  y,
  scale,
  rotate = 0,
  glow,
}: {
  x: number;
  y: number;
  scale: number;
  rotate?: number;
  glow: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <g filter={`url(#${glow})`} fill="var(--color-lime)">
        {EYES.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </g>
  );
}

function DesktopField({ className = "" }: { className?: string }) {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Only run on desktop screens (>= 768px)
    if (prefersReducedMotion() || window.innerWidth < 768) return;
    const svg = root.current;
    if (!svg) return;

    // pointer: each layer answers at its own rate, which is the depth cue
    const nodes = svg.querySelectorAll<SVGGElement>("[data-depth]");
    if (!nodes.length) return;

    const setters = [...nodes].map((n) => ({
      x: gsap.quickTo(n, "x", { duration: 1.3, ease: "power2.out" }),
      y: gsap.quickTo(n, "y", { duration: 1.3, ease: "power2.out" }),
      sx: gsap.quickTo(n, "scaleX", { duration: 1.6, ease: "power2.out" }),
      sy: gsap.quickTo(n, "scaleY", { duration: 1.6, ease: "power2.out" }),
      d: Number(n.dataset.depth) || 12,
    }));
    const stopPointer = subscribePointer((nx, ny) => {
      setters.forEach((l) => {
        l.x(-nx * l.d);
        l.y(-ny * l.d * 0.62);
        const s = 1 + (l.d / 1400) * (1 - Math.min(1, Math.hypot(nx, ny))) * 0.5 + l.d / 2600;
        l.sx(s);
        l.sy(s);
      });
    });

    // scroll: the whole field lags the content leaving the viewport
    gsap.registerPlugin(ScrollTrigger);
    const drift = gsap.to(svg, {
      yPercent: 13,
      ease: "none",
      scrollTrigger: {
        trigger: svg.parentElement,
        start: "top top",
        end: "bottom top",
        scrub: 0.4,
      },
    });

    // 60-120fps GPU Bezier liquid path morphing
    const stopLiquid = startLiquidFlow({
      svg,
      shapes: HERO_FIELD.shapes,
      ns: "hero",
      isMobile: false,
    });

    return () => {
      stopPointer();
      stopLiquid();
      drift.scrollTrigger?.kill();
      drift.kill();
    };
  }, []);

  return (
    <svg
      ref={root}
      viewBox={HERO_FIELD.viewBox}
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      <FieldDefs ns="hero" />

      {/* Morphing shape definitions: updated once per frame in JS, shared by all instances */}
      <defs>
        <path id="hero-flow-0" d={HERO_FIELD.shapes[0]} />
        <path id="hero-flow-1" d={HERO_FIELD.shapes[1]} />
      </defs>

      {/* hairlines ride just outside each field's edge — deforming in unison with the ink mass */}
      <g data-depth="54">
        <use
          href="#hero-flow-0"
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth={2}
          transform="translate(-36 28)"
          opacity={0.9}
        />
        <use
          href="#hero-flow-1"
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth={1.6}
          transform="translate(28 -20)"
          opacity={0.7}
        />
      </g>

      {/* Shadow underlay: static geometry so the 30px Gaussian blur is cached in GPU texture memory */}
      <g data-depth="20" aria-hidden="true">
        <path
          d={HERO_FIELD.shapes[0]}
          fill="rgba(8, 8, 8, 0.26)"
          transform="translate(0 16)"
          filter="url(#hero-shadow-blur)"
        />
      </g>

      {/* The main field — zero filter re-rasterization overhead, instant 60-120fps vector path rendering */}
      <g data-depth="20">
        <use href="#hero-flow-0" fill="var(--color-ink)" />
        <use href="#hero-flow-0" fill="url(#hero-wash)" stroke="url(#hero-rim)" strokeWidth={2.5} />
      </g>

      {/* Cat silhouette shadow underlay */}
      <g data-depth="38" aria-hidden="true">
        <path
          d={HERO_FIELD.shapes[1]}
          fill="rgba(8, 8, 8, 0.26)"
          transform="translate(0 16)"
          filter="url(#hero-shadow-blur)"
        />
      </g>

      {/* The cat-head silhouette in the corner — midground organic deformation */}
      <g data-depth="38">
        <use href="#hero-flow-1" fill="var(--color-ink)" />
        <use href="#hero-flow-1" fill="url(#hero-wash)" stroke="url(#hero-rim)" strokeWidth={2} />
      </g>

      {/* the eyes sit closer to the viewer and stay completely crisp */}
      <g data-depth="76">
        <Eyes x={1276} y={486} scale={1.28} rotate={-9} glow="hero-glow" />
      </g>
      <g data-depth="64">
        <Eyes x={214} y={800} scale={1.04} rotate={-3} glow="hero-glow" />
      </g>

      {/* stray filaments of light */}
      <g data-depth="32" opacity={0.8}>
        <path
          d="M-40 470C120 470 150 330 268 300C386 270 420 392 520 372"
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
        <path
          d="M1180 726C1268 700 1300 612 1392 604C1484 596 1540 660 1648 640"
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/**
 * Phone composition. Redrawn from the supplied mockup rather than cropped out
 * of the desktop one — the black mass runs as a band through the middle so the
 * lockup has a field to sit on and the off-white still frames it top and bottom.
 */
function MobileField({ className = "" }: { className?: string }) {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Only run on mobile screens (< 768px)
    if (prefersReducedMotion() || window.innerWidth >= 768) return;
    const svg = root.current;
    if (!svg) return;

    // Mobile pointer and gyro tilt parallax
    const nodes = svg.querySelectorAll<SVGGElement>("[data-depth]");
    const setters = [...nodes].map((n) => ({
      x: gsap.quickTo(n, "x", { duration: 1.4, ease: "power2.out" }),
      y: gsap.quickTo(n, "y", { duration: 1.4, ease: "power2.out" }),
      d: Number(n.dataset.depth) || 8,
    }));
    const stopPointer = subscribePointer((nx, ny) => {
      setters.forEach((l) => {
        l.x(-nx * l.d);
        l.y(-ny * l.d * 0.5);
      });
    });

    const stopLiquid = startLiquidFlow({
      svg,
      shapes: MOBILE_FIELD.shapes,
      ns: "mob",
      isMobile: true,
    });

    return () => {
      stopPointer();
      stopLiquid();
    };
  }, []);

  return (
    <svg
      ref={root}
      viewBox={MOBILE_FIELD.viewBox}
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      <FieldDefs ns="mob" isMobile={true} />

      {/* Morphing shape definitions */}
      <defs>
        <path id="mob-flow-0" d={MOBILE_FIELD.shapes[0]} />
        <path id="mob-flow-1" d={MOBILE_FIELD.shapes[1]} />
      </defs>

      <g data-depth="16">
        <use
          href="#mob-flow-0"
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth={1.4}
          transform="translate(-13 9)"
          opacity={0.85}
        />
      </g>
      <g data-depth="8" aria-hidden="true">
        <path
          d={MOBILE_FIELD.shapes[0]}
          fill="rgba(8, 8, 8, 0.22)"
          transform="translate(0 10)"
          filter="url(#mob-shadow-blur)"
        />
        <path
          d={MOBILE_FIELD.shapes[1]}
          fill="rgba(8, 8, 8, 0.22)"
          transform="translate(0 10)"
          filter="url(#mob-shadow-blur)"
        />
      </g>
      <g data-depth="8">
        <use href="#mob-flow-0" fill="var(--color-ink)" />
        <use href="#mob-flow-1" fill="var(--color-ink)" />
        <use href="#mob-flow-0" fill="url(#mob-wash)" stroke="url(#mob-rim)" strokeWidth={1.6} />
      </g>
      <g data-depth="22">
        <Eyes x={292} y={172} scale={0.5} rotate={-8} glow="mob-glow" />
      </g>
    </svg>
  );
}

