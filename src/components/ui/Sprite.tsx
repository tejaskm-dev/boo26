"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { SPRITE, type SpriteName } from "@/lib/sprites";
import { subscribePointer } from "@/lib/pointer";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Places one piece of the BOO! artwork.
 *
 * `scale` is a multiple of the artwork's own pixel size rather than a free
 * width, which keeps every prop rendering at or near 1:1 instead of being
 * blown up until it turns to mush. `drift` opts the piece into the same
 * pointer parallax the hero fields use.
 *
 * Both the float and the parallax are held until the piece is actually near
 * the viewport. The page carries sixty-odd of these; a looping tween and a
 * pointer subscription each, running the whole way down, is most of a frame
 * spent animating things nobody is looking at.
 */
export default function Sprite({
  name,
  scale = 1,
  drift = 0,
  idle = 0,
  className = "",
  alt = "",
  priority = false,
  style,
  ...rest
}: {
  name: SpriteName;
  /** multiple of the artwork's own pixel size */
  scale?: number;
  /** viewport-relative parallax, in px at the edges */
  drift?: number;
  /** slow idle float, in px — the cats are alive even when nothing happens */
  idle?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLSpanElement>) {
  const art = SPRITE[name];
  const wrap = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);
  const animated = (idle > 0 || drift > 0) && near;

  useEffect(() => {
    if (!idle && !drift) return;
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setNear(e.isIntersecting),
      { rootMargin: "15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [idle, drift]);

  useEffect(() => {
    if (!idle || !near || prefersReducedMotion()) return;
    const el = inner.current;
    if (!el) return;
    // a different phase and period per instance, so a row of cats never
    // breathes in unison
    const tween = gsap.to(el, {
      y: idle,
      rotate: idle * 0.12,
      duration: 2.4 + Math.random() * 1.6,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: Math.random() * 1.4,
    });
    return () => {
      tween.kill();
      gsap.set(el, { clearProps: "transform" });
    };
  }, [idle, near]);

  useEffect(() => {
    if (!drift || !near || prefersReducedMotion()) return;
    const el = wrap.current;
    if (!el) return;
    const x = gsap.quickTo(el, "x", { duration: 1.4, ease: "power2.out" });
    const y = gsap.quickTo(el, "y", { duration: 1.4, ease: "power2.out" });
    const unsubscribe = subscribePointer((nx, ny) => {
      x(-nx * drift);
      y(-ny * drift * 0.55);
    });
    return () => {
      unsubscribe();
      gsap.set(el, { clearProps: "x,y" });
    };
  }, [drift, near]);

  return (
    <span
      ref={wrap}
      className={`pointer-events-none block select-none ${className}`}
      style={{ width: `calc(${art.w * scale}px * var(--sprite-scale, 1))`, ...style }}
      {...rest}
    >
      <span ref={inner} className="block" style={animated ? { willChange: "transform" } : undefined}>
      <Image
        src={art.src}
        alt={alt}
        width={art.w}
        height={art.h}
        priority={priority}
        sizes={`${Math.round(art.w * scale)}px`}
        className="h-auto w-full"
        aria-hidden={alt === "" ? true : undefined}
      />
      </span>
    </span>
  );
}
