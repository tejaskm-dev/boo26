"use client";

import { useEffect, useRef } from "react";
import { GlowEyes } from "@/components/ui/Glyphs";
import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/motion";
import { setSoonWords } from "@/lib/toast";
import { SOCIALS } from "@/lib/brand";
import { TROLL } from "@/lib/soon";
import { answer, buzz, shiver, troll } from "./troll";

const IDLE = 22_000;
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
/** once a page load, whatever React's development double-mount does */
let greeted = false;

const CAT = String.raw`
   /\_/\
  ( o.o )   you opened the console.
   > ^ <    we like you already.
`;

/**
 * The page-wide jokes. Every one of them is a listener that does nothing
 * until it's set off — no timers ticking, nothing polling — and each fires
 * once a page load at most (see troll.ts).
 *
 * Nothing here is stored or sent anywhere: the jokes only use what the
 * browser already knows (the clock, which phone, dark mode) and then forget
 * it, which is why the privacy page stays true without a word changed.
 */
export default function Eggs() {
  const eyes = useRef<HTMLDivElement>(null);
  const dark = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const listen = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
      window.addEventListener(type, fn, opts);
      cleanups.push(() => window.removeEventListener(type, fn, opts));
    };

    // anything not live yet says so in the teaser's words
    const socials = new Set(SOCIALS.map((s) => s.label));
    setSoonWords((what) => (what && socials.has(what) ? TROLL.ghosted : TROLL.notYet));
    cleanups.push(() => setSoonWords(null));

    // for whoever opens the console
    if (!greeted) {
      greeted = true;
      console.log(`%c${CAT}`, "color:#d8ff28;background:#080808;font:12px/1.35 monospace;padding:6px 10px");
      console.log("%cwhat's your favourite scary movie?  (psst: /shh)", "color:#f3f0e7;background:#080808;padding:4px 10px");
    }

    // leave the tab, and it notices
    let title = document.title;
    let leftAt = 0;
    const onVisibility = () => {
      if (document.hidden) {
        title = document.title;
        leftAt = Date.now();
        document.title = TROLL.away;
      } else {
        document.title = title;
        if (leftAt && Date.now() - leftAt > 1500) troll("back", TROLL.back);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    cleanups.push(() => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.title = title;
    });

    // go quiet for a while, and something's in your walls
    let idle = 0;
    const wake = () => {
      window.clearTimeout(idle);
      if (eyes.current?.dataset.show) delete eyes.current.dataset.show;
      idle = window.setTimeout(() => {
        if (document.hidden) return;
        if (troll("walls", TROLL.walls) && eyes.current) eyes.current.dataset.show = "true";
      }, IDLE);
    };
    for (const e of ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const) listen(e, wake, { passive: true });
    wake();
    cleanups.push(() => window.clearTimeout(idle));

    // scroll like you're late for something
    const lenis = getLenis();
    if (lenis) {
      // properly flinging it, for a while — not one quick flick
      let since = 0;
      const onFast = ({ velocity }: { velocity: number }) => {
        if (Math.abs(velocity) < 140) {
          since = 0;
          return;
        }
        const now = performance.now();
        if (!since) since = now;
        else if (now - since > 900) troll("fast", TROLL.fast);
      };
      lenis.on("scroll", onFast);
      cleanups.push(() => lenis.off("scroll", onFast));
    }

    // a phone turned on its side
    const sideways = window.matchMedia("(orientation: landscape) and (max-height: 500px)");
    const onTurn = () => {
      if (sideways.matches) troll("sideways", TROLL.sideways);
    };
    sideways.addEventListener("change", onTurn);
    cleanups.push(() => sideways.removeEventListener("change", onTurn));

    // up past midnight, on your own clock
    const hour = new Date().getHours();
    if (hour < 4) {
      const late = window.setTimeout(() => troll("sleep", TROLL.sleep), 9000);
      cleanups.push(() => window.clearTimeout(late));
    }

    // lights out: the wordmark tapped seven times, or the code
    let lights = 0;
    const lightsOut = () => {
      const el = dark.current;
      if (!el || el.dataset.on) return;
      el.dataset.on = "true";
      window.clearTimeout(lights);
      lights = window.setTimeout(() => {
        delete el.dataset.on;
        window.setTimeout(() => answer(TROLL.nerd), 380);
      }, 1700);
    };
    cleanups.push(() => window.clearTimeout(lights));

    let marks: number[] = [];
    let cat: number[] = [];
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest) return;
      const now = Date.now();

      // "Come closer": a proper glide down, and the cat has something to say
      const closer = target.closest<HTMLAnchorElement>('a[href="#heard"]');
      if (closer && !closer.closest("#site-nav")) {
        const to = document.getElementById("heard");
        const glide = getLenis();
        if (to && glide) {
          e.preventDefault();
          glide.scrollTo(to, { duration: 1.5, onComplete: () => troll("closer", TROLL.closer) });
        } else {
          window.setTimeout(() => troll("closer", TROLL.closer), 700);
        }
        return;
      }

      // the cat on the logo, poked three times
      const lockup = target.closest("[data-lockup]");
      if (lockup) {
        cat = [...cat.filter((t) => now - t < 2000), now];
        if (cat.length >= 3) {
          cat = [];
          shiver(lockup, 8);
          buzz(35);
          answer(TROLL.boo);
        }
        return;
      }

      if (target.closest("[data-wordmark]")) {
        marks = [...marks.filter((t) => now - t < 3500), now];
        if (marks.length >= 7) {
          marks = [];
          lightsOut();
        }
      }
    };
    document.addEventListener("click", onClick);
    cleanups.push(() => document.removeEventListener("click", onClick));

    let code = 0;
    const onKey = (e: KeyboardEvent) => {
      code = e.key === KONAMI[code] || e.key.toLowerCase() === KONAMI[code] ? code + 1 : e.key === KONAMI[0] ? 1 : 0;
      if (code === KONAMI.length) {
        code = 0;
        lightsOut();
      }
    };
    listen("keydown", onKey);

    // type the club's name and its banner goes over (Banner.tsx) — µ is Option-M on a Mac
    let typed = "";
    const onType = (e: KeyboardEvent) => {
      if (e.key.length !== 1 || (e.target as Element | null)?.closest?.("input,textarea,select,[contenteditable]")) return;
      typed = (typed + e.key.toLowerCase()).slice(-7);
      if (typed.endsWith("mulearn") || typed.endsWith("µlearn")) {
        typed = "";
        window.dispatchEvent(new Event("soon:banner"));
      }
    };
    listen("keydown", onType);

    // the very bottom of the page: the cat has had enough
    const sign = document.querySelector("footer p.hand:last-of-type");
    if (sign) {
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          if (!troll("leaving", TROLL.leaving)) return;
          io.disconnect();
          const goodbye = document.querySelector<HTMLElement>('footer [data-desk] img[src*="cat-goodbye"]')?.closest<HTMLElement>("span.block");
          if (goodbye && !prefersReducedMotion()) {
            goodbye.animate(
              [
                { translate: "0 0", rotate: "0deg", opacity: 1 },
                { translate: "-10% -6%", rotate: "-6deg", opacity: 1, offset: 0.25 },
                { translate: "420% 0", rotate: "0deg", opacity: 0 },
              ],
              { duration: 1600, easing: "cubic-bezier(0.55, 0, 0.8, 0.4)", fill: "forwards" },
            );
          }
        },
        { threshold: 1 },
      );
      io.observe(sign);
      cleanups.push(() => io.disconnect());
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <>
      {/* i'm in your walls */}
      <div ref={eyes} className="soon-edge-eyes" aria-hidden="true">
        <GlowEyes variant="sly" className="w-full" glowId="soon-wall-eyes" />
      </div>

      {/* ok nerd */}
      <div ref={dark} className="soon-lights-out" aria-hidden="true">
        <GlowEyes variant="wink" className="w-[clamp(6rem,14vw,10rem)]" glowId="soon-dark-eyes" />
      </div>
    </>
  );
}
