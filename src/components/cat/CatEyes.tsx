"use client";

import { useEffect, useId, useRef } from "react";
import { gsap } from "gsap";
import { subscribePointer } from "@/lib/pointer";
import { prefersReducedMotion } from "@/lib/motion";
import type { CatEyeArt } from "@/lib/eyes";

/**
 * The lid is a wide, shallow ellipse — wide enough that the edge crossing the
 * eye reads as a straight-ish eyelid rather than a bubble — and it is clipped
 * to the painted eye, so it never puts flat black over the cat's shaded fur.
 */
const EYE_CLIP = 1.06;
const LID_SCALE_X = 1.9;
const LID_SCALE_Y = 1.18;

/**
 * Overlays the cat's pupils so they can move.
 *
 * The artwork's eye is a flat field of one lime, so a patch of that exact lime
 * covers the painted pupil and a live one is drawn on top — the rest of the
 * illustration (rim, glow, fur) is untouched. Geometry comes from
 * scripts/measure-eyes.py, in the asset's own pixel space, so it stays locked
 * to the art at every size.
 */
type Props = {
  art: CatEyeArt;
  /** follow the pointer (desktop only) */
  track?: boolean;
  /** pupils widen — used while the logo or a nav item is hovered */
  excited?: boolean;
  className?: string;
};

export default function CatEyes({ art, track = false, excited = false, className = "" }: Props) {
  const uid = useId().replace(/:/g, "");
  const root = useRef<SVGSVGElement>(null);
  const pupils = useRef<SVGGElement[]>([]);
  const lids = useRef<SVGEllipseElement[]>([]);

  // pointer tracking
  useEffect(() => {
    if (!track || prefersReducedMotion()) return;
    const el = root.current;
    if (!el) return;

    const setters = pupils.current.map((g) => ({
      x: gsap.quickTo(g, "x", { duration: 0.7, ease: "power3.out" }),
      y: gsap.quickTo(g, "y", { duration: 0.7, ease: "power3.out" }),
    }));

    let rect = el.getBoundingClientRect();
    let queued = false;
    const measure = () => {
      rect = el.getBoundingClientRect();
      queued = false;
    };
    const remeasure = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    };
    window.addEventListener("resize", remeasure, { passive: true });
    window.addEventListener("scroll", remeasure, { passive: true });

    // viewBox units per CSS pixel, so travel stays constant on screen
    const stop = subscribePointer((nx, ny) => {
      if (!rect.width) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const px = ((nx + 1) / 2) * window.innerWidth;
      const py = ((ny + 1) / 2) * window.innerHeight;
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.hypot(dx, dy) || 1;
      // ease off with distance so the eyes settle instead of pinning to a corner
      const reach = Math.min(1, dist / (rect.width * 0.75));
      const tx = (dx / dist) * reach * art.travel;
      const ty = (dy / dist) * reach * art.travel;
      setters.forEach((s) => {
        s.x(tx);
        s.y(ty);
      });
    });

    return () => {
      stop();
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", remeasure);
      setters.forEach((s) => {
        s.x(0);
        s.y(0);
      });
    };
  }, [art, track]);

  // idle blinking
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const targets = lids.current.filter(Boolean);
    if (!targets.length) return;

    // The lid hangs from the top of the eye and drops, rather than pinching
    // shut around the centre — so both ry and cy move together. Driving the
    // attributes (not a transform) keeps GSAP off the rotation that angles the
    // lid to the head, and avoids a first-frame flash.
    const geom = art.eyes.map((e) => ({
      ry: e.eye.ry * LID_SCALE_Y,
      top: e.eye.cy - e.eye.ry * EYE_CLIP,
    }));
    const lid = (
      tl: gsap.core.Timeline,
      state: "open" | "closed",
      duration: number,
      ease: string,
      at: string,
    ) =>
      targets.forEach((el, i) => {
        const ry = state === "closed" ? geom[i].ry : 0.01;
        tl.to(el, { attr: { ry, cy: geom[i].top + ry }, duration, ease }, at);
      });

    let timer: ReturnType<typeof setTimeout>;
    const blink = () => {
      const tl = gsap.timeline();
      lid(tl, "closed", 0.07, "power2.in", "<");
      lid(tl, "open", 0.11, "power2.out", ">0.03");
      // now and then, a double blink
      if (Math.random() < 0.28) {
        lid(tl, "closed", 0.06, "power2.in", ">0.1");
        lid(tl, "open", 0.1, "power2.out", ">");
      }
      timer = setTimeout(blink, 2800 + Math.random() * 6200);
    };
    timer = setTimeout(blink, 1800 + Math.random() * 2600);
    return () => {
      clearTimeout(timer);
      gsap.killTweensOf(targets);
    };
  }, [art]);

  // reaction
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const targets = pupils.current.filter(Boolean);
    if (!targets.length) return;
    gsap.to(targets, {
      scale: excited ? 1.16 : 1,
      duration: excited ? 0.45 : 0.7,
      ease: excited ? "back.out(3)" : "elastic.out(1, 0.6)",
      transformOrigin: "50% 50%",
    });
  }, [excited]);

  return (
    <svg
      ref={root}
      viewBox={`0 0 ${art.box.w} ${art.box.h}`}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        {art.eyes.map((e, i) => (
          <clipPath key={i} id={`${uid}-eye-${i}`}>
            <ellipse
              cx={e.eye.cx}
              cy={e.eye.cy}
              rx={e.eye.rx * EYE_CLIP}
              ry={e.eye.ry * EYE_CLIP}
              transform={`rotate(${e.eye.deg} ${e.eye.cx} ${e.eye.cy})`}
            />
          </clipPath>
        ))}
      </defs>
      {art.eyes.map((e, i) => (
        <g key={i}>
          <ellipse
            cx={e.patch.cx}
            cy={e.patch.cy}
            rx={e.patch.rx}
            ry={e.patch.ry}
            fill="var(--color-lime-art)"
          />
          <g ref={(n) => { if (n) pupils.current[i] = n; }}>
            <ellipse cx={e.pupil.cx} cy={e.pupil.cy} rx={e.pupil.rx} ry={e.pupil.ry} fill="#0a0a0a" />
            <circle cx={e.glint.cx} cy={e.glint.cy} r={e.glint.r} fill="#ffffff" />
          </g>
          {/* the lid comes down along the line the head is painted on, and is
              clipped to the eye so only the lime is ever covered */}
          <g clipPath={`url(#${uid}-eye-${i})`}>
            <g transform={`rotate(${art.tilt} ${e.eye.cx} ${e.eye.cy})`}>
              <ellipse
                ref={(n) => { if (n) lids.current[i] = n; }}
                cx={e.eye.cx}
                cy={e.eye.cy - e.eye.ry * EYE_CLIP + 0.01}
                rx={e.eye.rx * LID_SCALE_X}
                ry={0.01}
                fill="#070707"
              />
            </g>
          </g>
        </g>
      ))}
    </svg>
  );
}
