"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Pulls whatever it wraps toward the cursor as the cursor approaches, and lets
 * it fall back when the cursor leaves.
 *
 * The point is that a control answers before it is clicked: the target is
 * easier to hit because it comes to meet you, and the page reads as paying
 * attention. Listeners are attached only while the pointer is actually near,
 * so an idle button costs nothing.
 */
export default function Magnetic({
  children,
  strength = 0.32,
  radius = 90,
  className = "",
}: {
  children: React.ReactNode;
  /** how far it travels as a share of the cursor's offset */
  strength?: number;
  /** px beyond the element's own box that still counts as near */
  radius?: number;
  className?: string;
}) {
  const wrap = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const near =
        Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius;
      if (near) {
        x(dx * strength);
        y(dy * strength);
      } else {
        x(0);
        y(0);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength, radius]);

  return (
    <span ref={wrap} className={`inline-block will-change-transform ${className}`}>
      {children}
    </span>
  );
}
