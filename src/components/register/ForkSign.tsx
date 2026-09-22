"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Sprite from "@/components/ui/Sprite";
import RiseIn from "@/components/fx/RiseIn";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The signpost at the fork. It sways where it stands, and points: hover or
 * focus either path and it leans that way, back upright when you leave.
 *
 * Two layers, so the sway and the lean never fight over one rotation.
 */
export default function ForkSign({ className = "" }: { className?: string }) {
  const sway = useRef<HTMLSpanElement>(null);
  const lean = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const s = sway.current;
    const l = lean.current;
    if (!s || !l || prefersReducedMotion()) return;

    const idle = gsap.to(s, {
      rotation: 2.6,
      duration: 3.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      transformOrigin: "50% 92%",
    });

    const paths = Array.from(document.querySelectorAll<HTMLElement>("[data-path]"));
    const point = (to: number) =>
      gsap.to(l, { rotation: to, duration: 0.55, ease: "back.out(2.2)", transformOrigin: "50% 92%" });
    const off = paths.map((el) => {
      const towards = () => point(el.dataset.path === "A" ? -7 : 7);
      const back = () => point(0);
      el.addEventListener("pointerenter", towards);
      el.addEventListener("pointerleave", back);
      el.addEventListener("focusin", towards);
      el.addEventListener("focusout", back);
      return () => {
        el.removeEventListener("pointerenter", towards);
        el.removeEventListener("pointerleave", back);
        el.removeEventListener("focusin", towards);
        el.removeEventListener("focusout", back);
      };
    });

    return () => {
      idle.kill();
      off.forEach((fn) => fn());
      gsap.set([s, l], { clearProps: "transform" });
    };
  }, []);

  return (
    <RiseIn className={className} start="top 100%">
      <span ref={sway} className="block">
        <span ref={lean} className="block">
          <Sprite name="signboard" scale={0.5} drift={14} />
        </span>
      </span>
    </RiseIn>
  );
}
