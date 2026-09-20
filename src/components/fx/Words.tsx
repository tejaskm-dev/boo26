"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The house heading reveal: each word rises out of its own clip, slightly
 * rotated, a beat behind the one before it. Same language as the fullscreen
 * index, so every big line on the page arrives the same way.
 *
 * clip-path rather than overflow so the line box is untouched — a tilted word
 * never gets shaved and the layout never shifts.
 */
export default function Words({
  children,
  className = "",
  stagger = 0.085,
  as: Tag = "span",
}: {
  children: string;
  className?: string;
  stagger?: number;
  as?: "span" | "h2" | "h3" | "p";
}) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLElement>("[data-word]");
    if (!words.length) return;

    if (prefersReducedMotion()) {
      gsap.set(words, { yPercent: 0, rotate: 0, autoAlpha: 1 });
      const clips = el.querySelectorAll<HTMLElement>("[data-clip]");
      clips.forEach((c) => {
        c.style.clipPath = "none";
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 116, rotate: 4, autoAlpha: 0 },
        {
          yPercent: 0,
          rotate: 0,
          autoAlpha: 1,
          duration: 1,
          ease: "power4.out",
          stagger,
          clearProps: "willChange",
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
          onComplete: () => {
            const clips = el.querySelectorAll<HTMLElement>("[data-clip]");
            clips.forEach((c) => {
              c.style.clipPath = "none";
            });
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [stagger]);

  const lines = children.split("\n");

  return (
    <Tag ref={root as never} className={className}>
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.split(" ").map((word, wi) => (
            <span
              key={`${li}-${wi}`}
              data-clip
              className="inline-block"
              style={{ clipPath: "inset(-0.42em -0.5em -0.28em -0.3em)" }}
            >
              <span data-word className="inline-block">
                {word}
              </span>
              {wi < line.split(" ").length - 1 ? " " : null}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
