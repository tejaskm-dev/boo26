"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SPRITE, type SpriteName } from "@/lib/sprites";
import { subscribePointer } from "@/lib/pointer";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Places one piece of the BOO! artwork.
 *
 * The board these were cut from is only 1536px across, so each asset has a
 * small intrinsic size. `scale` is a multiple of that size rather than a free
 * width, which keeps every prop rendering at or near 1:1 instead of being
 * blown up until it turns to mush. `drift` opts the piece into the same
 * pointer parallax the hero fields use.
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

  useEffect(() => {
    if (!idle || prefersReducedMotion()) return;
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
    };
  }, [idle]);

  useEffect(() => {
    if (!drift || prefersReducedMotion()) return;
    const el = wrap.current;
    if (!el) return;
    const x = gsap.quickTo(el, "x", { duration: 1.4, ease: "power2.out" });
    const y = gsap.quickTo(el, "y", { duration: 1.4, ease: "power2.out" });
    return subscribePointer((nx, ny) => {
      x(-nx * drift);
      y(-ny * drift * 0.55);
    });
  }, [drift]);

  return (
    <span
      ref={wrap}
      className={`pointer-events-none block select-none ${className}`}
      style={{ width: `${art.w * scale}px`, ...style }}
      {...rest}
    >
      <span ref={inner} className="block will-change-transform">
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
