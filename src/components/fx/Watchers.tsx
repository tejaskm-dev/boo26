"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";
import { answer, buzz } from "@/components/soon/troll";

type Eye = { wrap: HTMLElement; eye: HTMLElement | null; x: number; y: number; r: number; shutUntil: number; shut: boolean; lx: number; ly: number };

/**
 * The eyes in the dark sections (each pair of the hero's eyes wrapped in
 * `data-watch`): they follow you a little, narrow, and shut when you get too
 * close — and a poke shuts them for a while, and they say so.
 *
 * "You" is the cursor; on a phone, your finger while it's on the glass.
 * The same as the teaser's Critters does for its eyes, without the canvas:
 * driven by the pointer rather than a loop, at most once a frame, with every
 * eye's place measured when the page lays out — never while you move.
 */
export default function Watchers({ poke }: { /** what an eye says when it's poked */ poke: string }) {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    let eyes: Eye[] = [];
    const measure = () => {
      const y0 = window.scrollY;
      eyes = [...document.querySelectorAll<HTMLElement>("[data-watch]")]
        .filter((wrap) => wrap.offsetParent !== null)
        .map((wrap) => {
          const b = wrap.getBoundingClientRect();
          const was = eyes.find((e) => e.wrap === wrap);
          return {
            wrap,
            eye: wrap.querySelector<HTMLElement>(".soon-inkeyes"),
            // (the translate it already has is a few px at most: near enough)
            x: b.left + b.width / 2,
            y: b.top + y0 + b.height / 2,
            r: b.width / 2,
            shutUntil: was?.shutUntil ?? 0,
            shut: was?.shut ?? false,
            lx: was?.lx ?? 0,
            ly: was?.ly ?? 0,
          };
        });
    };

    let px = -9999;
    let py = -9999;
    let frame = 0;
    let reopen = 0;
    const update = () => {
      frame = 0;
      const now = performance.now();
      const y0 = window.scrollY;
      const vh = window.innerHeight;
      let soonest = Infinity;
      for (const e of eyes) {
        const sy = e.y - y0;
        if (sy < -200 || sy > vh + 200) continue;
        const d = Math.hypot(e.x - px, sy - py);
        if (d < e.r + 110) e.shutUntil = Math.max(e.shutUntil, now + 900);
        const shut = now < e.shutUntil;
        if (shut) soonest = Math.min(soonest, e.shutUntil - now);
        if (shut !== e.shut && e.eye) {
          e.shut = shut;
          if (shut) e.eye.dataset.shut = "true";
          else delete e.eye.dataset.shut;
        }
        const reach = Math.max(2, e.r * 0.08);
        const lx = Math.max(-1, Math.min(1, (px - e.x) / 320)) * reach;
        const ly = Math.max(-1, Math.min(1, (py - sy) / 320)) * reach * 0.6;
        if (Math.abs(lx - e.lx) > 0.25 || Math.abs(ly - e.ly) > 0.25) {
          e.lx = lx;
          e.ly = ly;
          e.wrap.style.translate = `${lx.toFixed(1)}px ${ly.toFixed(1)}px`;
        }
      }
      // open again once you've moved off, even if you've stopped moving
      window.clearTimeout(reopen);
      if (soonest < Infinity) reopen = window.setTimeout(queue, soonest + 20);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      px = e.clientX;
      py = e.clientY;
      queue();
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      px = t.clientX;
      py = t.clientY;
      queue();
    };
    const onDown = (e: PointerEvent) => {
      const y = e.clientY + window.scrollY;
      for (const eye of eyes) {
        if (Math.hypot(eye.x - e.clientX, eye.y - y) < eye.r + 16) {
          eye.shutUntil = performance.now() + 2600;
          buzz(12);
          answer(poke);
          px = e.clientX;
          py = e.clientY;
          queue();
          return;
        }
      }
    };

    measure();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("scroll", queue, { passive: true });
    ScrollTrigger.addEventListener("refresh", measure);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", queue);
      ScrollTrigger.removeEventListener("refresh", measure);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(frame);
      window.clearTimeout(reopen);
    };
  }, [poke]);

  return null;
}
