"use client";

import { useEffect, useRef } from "react";
import { GlowEyes } from "@/components/ui/Glyphs";
import { getLenis } from "@/lib/lenis";
import { OPEN_EVENT } from "@/lib/motion";
import { isNavActive } from "@/lib/navState";
import { SURVIVAL } from "@/lib/site";
import { answer, buzz, shiver, troll } from "@/components/soon/troll";

const IDLE = 25_000;
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
/** the longest word listened for, so the typed tail never grows past it */
const LONGEST = Math.max(...Object.keys(SURVIVAL.typed).map((w) => w.length));
/** once a page load, whatever React's development double-mount does */
let greeted = false;

type BatteryLike = { level: number; charging: boolean };

/**
 * The full site's easter eggs, the way the teaser has its own (soon/Eggs.tsx):
 * a handful of jokes that all hint at the night's prompt — you're stuck in a
 * horror story, and what gets you out is what you build — without saying it.
 *
 * Every one is a listener that does nothing until it's set off — no timers
 * ticking, nothing polling — and each fires once a page load at most, one
 * toast at a time (troll.ts). Nothing is stored or sent anywhere: they use
 * what the browser already knows (the clock, the battery where it says, that
 * the tab was left) and forget it, as the privacy page says.
 */
export default function Survival() {
  const dark = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const listen = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
      window.addEventListener(type, fn, opts);
      cleanups.push(() => window.removeEventListener(type, fn, opts));
    };
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(fn, ms);
      cleanups.push(() => window.clearTimeout(t));
    };
    // after the loading screen has lifted, never over it
    const opened = (fn: () => void) => {
      if (!document.documentElement.dataset.wipe) return fn();
      window.addEventListener(OPEN_EVENT, fn, { once: true });
      cleanups.push(() => window.removeEventListener(OPEN_EVENT, fn));
    };

    // for whoever opens the console: they'd be the ones checking for exits
    if (!greeted) {
      greeted = true;
      const [a, b] = SURVIVAL.console.cat;
      console.log(
        `%c\n   /\\_/\\\n  ( o.o )   ${a}\n   > ^ <    ${b}\n`,
        "color:#d8ff28;background:#080808;font:12px/1.35 monospace;padding:6px 10px",
      );
      console.log(`%c${SURVIVAL.console.rules.join("\n")}`, "color:#f3f0e7;background:#080808;font:12px/1.5 monospace;padding:6px 10px");
      console.log(`%c${SURVIVAL.console.hint}`, "color:#d8ff28;background:#080808;padding:4px 10px");
    }

    // leave the tab, and it doesn't want you out there
    let title = document.title;
    let leftAt = 0;
    const onVisibility = () => {
      if (document.hidden) {
        title = document.title;
        leftAt = Date.now();
        document.title = SURVIVAL.away;
      } else {
        document.title = title;
        if (leftAt && Date.now() - leftAt > 1500) troll("back", SURVIVAL.back);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    cleanups.push(() => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.title = title;
    });

    // go still for a long while, and it notices (the cat that peeks up from
    // the bottom of the screen is the one that comes to look: Peeker.tsx)
    let idle = 0;
    const wake = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        if (!document.hidden) troll("idle", SURVIVAL.idle);
      }, IDLE);
    };
    for (const e of ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const) listen(e, wake, { passive: true });
    wake();
    cleanups.push(() => window.clearTimeout(idle));

    // flinging the page like something's after you
    const lenis = getLenis();
    if (lenis) {
      let since = 0;
      const onFast = ({ velocity }: { velocity: number }) => {
        if (Math.abs(velocity) < 140) {
          since = 0;
          return;
        }
        const now = performance.now();
        if (!since) since = now;
        else if (now - since > 900) troll("fast", SURVIVAL.fast);
      };
      lenis.on("scroll", onFast);
      cleanups.push(() => lenis.off("scroll", onFast));
    }

    // up past midnight, on your own clock
    if (new Date().getHours() < 4) opened(() => later(() => troll("late", SURVIVAL.late), 9000));

    // a phone about to die — the oldest trick in the genre
    opened(() =>
      later(() => {
        const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryLike> };
        nav
          .getBattery?.()
          .then((b) => {
            if (!b.charging && b.level > 0 && b.level <= 0.2) troll("battery", SURVIVAL.battery(Math.round(b.level * 100)));
          })
          .catch(() => {
            /* not told, and that's fine */
          });
      }, 12_000),
    );

    // lights out: the wordmark tapped seven times, or the code
    let lights = 0;
    const lightsOut = () => {
      const el = dark.current;
      if (!el || el.dataset.on) return;
      el.dataset.on = "true";
      window.clearTimeout(lights);
      lights = window.setTimeout(() => {
        delete el.dataset.on;
        window.setTimeout(() => answer(SURVIVAL.lights), 380);
      }, 1700);
    };
    cleanups.push(() => window.clearTimeout(lights));

    let marks: number[] = [];
    let pokes: number[] = [];
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest) return;
      const now = Date.now();

      // the cat on the logo, poked three times
      const lockup = target.closest("[data-lockup]");
      if (lockup) {
        pokes = [...pokes.filter((t) => now - t < 2000), now];
        if (pokes.length >= 3) {
          pokes = [];
          shiver(lockup, 8);
          buzz(35);
          answer(SURVIVAL.lockup);
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

    // the keyboard: the code, Escape with nothing to close, and a few words
    // typed at the page itself (never in the newsletter box)
    let code = 0;
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      code = e.key === KONAMI[code] || e.key.toLowerCase() === KONAMI[code] ? code + 1 : e.key === KONAMI[0] ? 1 : 0;
      if (code === KONAMI.length) {
        code = 0;
        buzz(30);
        answer(SURVIVAL.konami);
        lightsOut();
        return;
      }

      // read before the menu's own handler closes it, so closing it isn't the joke
      if (e.key === "Escape") {
        if (!isNavActive()) troll("pause", SURVIVAL.pause);
        return;
      }

      if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as Element | null)?.closest?.("input,textarea,select,[contenteditable]")) return;
      typed = (typed + e.key.toLowerCase()).slice(-LONGEST);
      for (const [word, line] of Object.entries(SURVIVAL.typed)) {
        if (typed.endsWith(word)) {
          typed = "";
          troll(`typed-${line}`, line);
          break;
        }
      }
    };
    listen("keydown", onKey, { capture: true });

    // the very bottom of the page
    const sign = document.querySelector("footer p.hand:last-of-type");
    if (sign) {
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          if (troll("end", SURVIVAL.end)) io.disconnect();
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
      {/* lights out */}
      <div
        ref={dark}
        aria-hidden="true"
        className="invisible fixed inset-0 z-[85] grid place-items-center bg-ink opacity-0 [transition:opacity_0.35s_ease,visibility_0s_linear_0.35s] data-[on=true]:visible data-[on=true]:opacity-100 data-[on=true]:[transition:opacity_0.25s_ease]"
      >
        <GlowEyes variant="wink" className="w-[clamp(6rem,14vw,10rem)]" glowId="live-dark-eyes" />
      </div>
    </>
  );
}
