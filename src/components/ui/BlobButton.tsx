"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The register control. Not a pill — a slightly melted slab whose top and
 * bottom edges sag inward, drawn as SVG so it can actually deform on hover.
 * Both path strings share a command structure, which is what lets GSAP
 * interpolate between them without a morph plugin.
 */
const REST =
  "M6 36C6 16 20 7 44 6C78 5 96 15 120 15C144 15 162 5 196 6C220 7 234 16 234 36C234 56 220 65 196 66C162 67 144 57 120 57C96 57 78 67 44 66C20 65 6 56 6 36Z";
const HOVER =
  "M3 36C3 12 21 3 44 2C78 1 96 8 120 8C144 8 162 1 196 2C219 3 237 12 237 36C237 60 219 69 196 70C162 71 144 64 120 64C96 64 78 71 44 70C21 69 3 60 3 36Z";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: React.ReactNode;
  size?: "sm" | "lg";
  tone?: "lime" | "ink";
};

export default function BlobButton({
  href,
  children,
  size = "sm",
  tone = "lime",
  className = "",
  ...rest
}: Props) {
  const root = useRef<HTMLAnchorElement>(null);
  const shape = useRef<SVGPathElement>(null);
  const glow = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const arrow = useRef<SVGSVGElement>(null);

  // magnetic pull: the button leans toward the pointer while it is near
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    const label = gsap.quickTo(shape.current, "x", { duration: 0.6, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const reach = Math.max(r.width, r.height) * 0.9;
      const near = Math.hypot(dx, dy) < reach;
      x(near ? dx * 0.22 : 0);
      y(near ? dy * 0.3 : 0);
      label(near ? dx * 0.04 : 0);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      x(0);
      y(0);
    };
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const enter = () => {
      gsap.to(shape.current, { attr: { d: HOVER }, duration: 0.55, ease: "power3.out" });
      gsap.to(glow.current, { opacity: 0.9, scale: 1.2, duration: 0.55, ease: "power3.out" });
      gsap.to(label.current, { x: -3, duration: 0.45, ease: "power3.out" });
      gsap.to(arrow.current, { x: 5, y: -4, rotate: 8, duration: 0.45, ease: "back.out(2.4)" });
    };
    const leave = () => {
      gsap.to(shape.current, { attr: { d: REST }, duration: 0.75, ease: "elastic.out(1, 0.65)" });
      gsap.to(glow.current, { opacity: 0.35, scale: 1, duration: 0.6, ease: "power3.out" });
      gsap.to(label.current, { x: 0, duration: 0.5, ease: "power3.out" });
      gsap.to(arrow.current, { x: 0, y: 0, rotate: 0, duration: 0.6, ease: "elastic.out(1, 0.6)" });
    };

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focus", enter);
    el.addEventListener("blur", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focus", enter);
      el.removeEventListener("blur", leave);
    };
  }, []);

  const pad = size === "lg" ? "px-9 py-5 md:px-12 md:py-6" : "px-6 py-3.5 md:px-7 md:py-4";
  const type = size === "lg" ? "text-[0.8rem] md:text-[0.92rem]" : "text-[0.66rem] md:text-[0.72rem]";
  const fill = tone === "lime" ? "var(--color-lime)" : "var(--color-ink)";
  const ink = tone === "lime" ? "text-ink" : "text-bone";

  return (
    <a
      ref={root}
      href={href}
      className={`group relative inline-flex isolate items-center justify-center outline-none ${pad} ${className}`}
      {...rest}
    >
      <span
        ref={glow}
        aria-hidden="true"
        className="pointer-events-none absolute inset-[16%] -z-10 rounded-[50%] opacity-35 blur-2xl"
        style={{ background: fill }}
      />
      <svg
        viewBox="0 0 240 72"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full"
      >
        <path ref={shape} d={REST} fill={fill} />
      </svg>
      <span
        className={`label relative flex items-center gap-2.5 whitespace-nowrap ${type} ${ink} group-focus-visible:underline group-focus-visible:underline-offset-4`}
      >
        <span ref={label}>{children}</span>
        <svg
          ref={arrow}
          viewBox="0 0 12 12"
          className="h-[0.7em] w-[0.7em] shrink-0 overflow-visible"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8" />
        </svg>
      </span>
    </a>
  );
}
