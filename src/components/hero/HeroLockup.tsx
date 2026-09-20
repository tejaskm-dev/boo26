"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CatEyes from "@/components/cat/CatEyes";
import { LOCKUP_EYES } from "@/lib/eyes";
import { subscribePointer } from "@/lib/pointer";
import { prefersReducedMotion, useFinePointer } from "@/lib/motion";

/**
 * The supplied lockup, oversized, with its cat wired up. The image is never
 * redrawn — only the pupils sit on top of it.
 */
export default function HeroLockup({
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  const wrap = useRef<HTMLDivElement>(null);
  const drift = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const fine = useFinePointer();

  // the lockup rides in front of the fields, answering pointer on desktop and tilt on mobile
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = wrap.current;
    if (!el) return;

    // Desktop mouse travel vs mobile tilt travel
    const travelX = fine ? 30 : 16;
    const travelY = fine ? 18 : 10;
    const rot = fine ? 1.1 : 0.6;

    const x = gsap.quickTo(el, "x", { duration: fine ? 1.2 : 0.9, ease: "power2.out" });
    const y = gsap.quickTo(el, "y", { duration: fine ? 1.2 : 0.9, ease: "power2.out" });
    const r = gsap.quickTo(el, "rotation", { duration: fine ? 1.6 : 1.1, ease: "power2.out" });

    return subscribePointer((nx, ny) => {
      x(nx * travelX);
      y(ny * travelY);
      r(nx * rot);
    });
  }, [fine]);

  // and it leaves the viewport a little ahead of everything behind it
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = drift.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const tween = gsap.to(el, {
      yPercent: -16,
      scale: 0.94,
      ease: "none",
      scrollTrigger: {
        trigger: el.closest("section"),
        start: "top top",
        end: "bottom top",
        scrub: 0.4,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div
      ref={wrap}
      className={`relative ${className}`}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      {...rest}
    >
      <div ref={drift} className="w-full will-change-transform">
        <div
          data-lockup
          className="relative w-full transition-transform duration-700 ease-[var(--ease-out-soft)] hover:scale-[1.012]"
          style={{ aspectRatio: "1350 / 909" }}
        >
          <Image
            src="/assets/boo-lockup.webp"
            alt="BOO! 2026"
            fill
            priority
            sizes="(max-width: 767px) 96vw, (max-width: 1279px) 72vw, 62vw"
            className="object-contain"
          />
          <CatEyes art={LOCKUP_EYES} track={true} excited={hovered} />
        </div>
      </div>
    </div>
  );
}
