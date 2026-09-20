"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

const REST =
  "M41.76 30.77C40.41 33.66 32.16 34.31 28.11 36.15C24.05 37.99 20.37 42.74 17.44 41.83C14.52 40.93 12.62 34.39 10.57 30.71C8.52 27.03 4 22.74 5.15 19.74C6.3 16.74 12.8 14.78 17.48 12.73C22.16 10.68 30.11 6.43 33.23 7.45C36.35 8.46 34.77 14.93 36.19 18.82C37.61 22.71 43.11 27.89 41.76 30.77Z";
const FLEX =
  "M42.52 33.76C41.08 36.49 31.99 34.23 27.72 35.58C23.45 36.94 19.37 42.97 16.88 41.89C14.4 40.81 14.72 32.88 12.79 29.1C10.85 25.32 4.53 21.99 5.28 19.21C6.03 16.43 13.59 14.62 17.3 12.45C21.01 10.27 24.38 5.05 27.56 6.18C30.73 7.31 33.86 14.62 36.36 19.22C38.85 23.82 43.96 31.03 42.52 33.76Z";

export default function CloseButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  const root = useRef<HTMLButtonElement>(null);
  const shape = useRef<SVGPathElement>(null);
  const cross = useRef<SVGGElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const enter = () => {
      gsap.to(shape.current, { attr: { d: FLEX }, duration: 0.5, ease: "power3.out" });
      gsap.to(cross.current, { rotate: 90, duration: 0.6, ease: "power3.out", transformOrigin: "50% 50%" });
      gsap.to(el, { scale: 1.08, duration: 0.5, ease: "power3.out" });
    };
    const leave = () => {
      gsap.to(shape.current, { attr: { d: REST }, duration: 0.65, ease: "elastic.out(1, 0.7)" });
      gsap.to(cross.current, { rotate: 0, duration: 0.7, ease: "elastic.out(1, 0.7)", transformOrigin: "50% 50%" });
      gsap.to(el, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.65)" });
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

  return (
    <button
      ref={root}
      type="button"
      onClick={onClick}
      aria-label="Close menu"
      className={`group grid h-12 w-12 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-4 focus-visible:ring-offset-transparent md:h-[3.5rem] md:w-[3.5rem] ${className}`}
    >
      <svg viewBox="0 0 48 48" className="h-full w-full overflow-visible" aria-hidden="true">
        <path
          ref={shape}
          d={REST}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinejoin="round"
          className="transition-[stroke] duration-300 group-hover:stroke-[var(--color-lime)]"
        />
        <g ref={cross} stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
          <path d="M18.5 18.5 29.5 29.5M29.5 18.5 18.5 29.5" />
        </g>
      </svg>
    </button>
  );
}
