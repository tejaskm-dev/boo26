"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion, whenOpen } from "@/lib/motion";

/**
 * A heading with nerves. Its letters rise in like every heading on the site,
 * and after that they shake whenever something comes near — the cursor on a
 * laptop, a tap on a phone, or just scrolling up to it. The shaking is a CSS
 * animation switched on by one attribute, so it costs nothing while it's calm.
 */
export default function Tremble({
  children,
  className = "",
  as: Tag = "h2",
}: {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    let calm = 0;
    const shake = (ms = 1100) => {
      el.dataset.shiver = "true";
      window.clearTimeout(calm);
      calm = window.setTimeout(() => delete el.dataset.shiver, ms);
    };
    let ctx: gsap.Context | undefined;
    const stop = whenOpen(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          el.querySelectorAll("[data-l]"),
          { yPercent: 120, rotate: 8, autoAlpha: 0 },
          {
            yPercent: 0,
            rotate: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: "back.out(1.6)",
            stagger: 0.035,
            scrollTrigger: { trigger: el, start: "top 84%", once: true },
            onComplete: () => shake(1400),
          },
        );
      }, el);
    });
    const near = () => shake();
    el.addEventListener("pointerenter", near);
    el.addEventListener("pointerdown", near);
    return () => {
      stop();
      ctx?.revert();
      window.clearTimeout(calm);
      el.removeEventListener("pointerenter", near);
      el.removeEventListener("pointerdown", near);
    };
  }, []);

  return (
    <Tag ref={root as never} className={className} aria-label={children.replace(/\n/g, " ")}>
      {children.split("\n").map((line, li) => (
        <span key={li} aria-hidden="true" className="block whitespace-nowrap">
          {[...line].map((ch, i) => (
            <span key={i} data-l className="soon-tremble inline-block" style={{ "--i": li * 9 + i } as React.CSSProperties}>
              {ch === " " ? " " : ch}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
