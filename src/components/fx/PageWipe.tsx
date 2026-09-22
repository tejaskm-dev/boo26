"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { EVENT } from "@/lib/site";
import { MD, OPEN_EVENT, prefersReducedMotion } from "@/lib/motion";
import { getLenis } from "@/lib/lenis";
import { STORAGE } from "@/lib/storage";

/**
 * The page wipe, and the preloader it doubles as.
 *
 * Leaving: a link to another page of the site grows two discs out of whatever
 * was clicked — ink, then bone a beat behind, the fullscreen menu's wipe — and
 * the browser only navigates once the screen is covered. The next page is
 * prefetched while that plays.
 *
 * Arriving, and on every load: the script at the top of <body> covers the page
 * before its first paint and starts the count (src/lib/wipe.ts). The cover is
 * the preloader — the wordmark filling with ink and a count to 100 — and once
 * the page is actually ready (fonts, the images the load event waits on, a
 * couple of settled frames) the count finishes and the discs close, bone
 * first, into the control that leads back ([data-wipe-origin]). Entrances wait
 * for that (see whenOpen), so they play where they're seen.
 *
 * The count is stepped per drawn frame, never on a clock, so it can't finish
 * where nobody saw it: in a background tab or a prerendered page it waits to
 * be on screen, and on a phone too busy to draw it pauses instead of skipping.
 *
 * The discs are scaled with transforms on the browser's animation clock
 * rather than tweened as clip-paths: transforms run on the compositor, so the
 * wipe stays smooth while the main thread is busy starting the next page, and
 * it keeps wall-clock time where frames are scarce — GSAP's lag smoothing slows
 * to a crawl there, which is how a clip-path wipe could strand a page under
 * its cover. Every wait is also capped by a plain timer for the same reason.
 *
 * Full page loads on purpose: the page-wide motion (Lenis, reveals, pins) is
 * mounted once per document, so a client-side route change would arrive at a
 * page nothing is animating.
 */
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)"; // GSAP's power3.inOut — the menu's wipe
const EASE_IN = "cubic-bezier(0.64, 0, 0.78, 0)";

/** The arrival runs once per document — React runs effects twice in development. */
let arrived = false;

type Origin = { x: number; y: number; r: number };

/** the centre of an element if it's on screen (else the screen's), and the reach that covers the screen from it */
function originOf(el?: Element | null): Origin {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const b = el?.getBoundingClientRect();
  const on = !!b && b.width > 0 && b.bottom > 0 && b.top < h && b.right > 0 && b.left < w;
  const x = on ? b.left + b.width / 2 : w / 2;
  const y = on ? b.top + b.height / 2 : h / 2;
  return { x, y, r: Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) + 2 };
}

/** size a disc so that at scale 1 it covers the screen from the origin */
function place(disc: HTMLElement, { x, y, r }: Origin) {
  const s = disc.style;
  s.left = `${x - r}px`;
  s.top = `${y - r}px`;
  s.width = `${r * 2}px`;
  s.height = `${r * 2}px`;
}

function scale(disc: HTMLElement, from: number, to: number, duration: number, delay = 0) {
  return disc.animate([{ transform: `scale(${from})` }, { transform: `scale(${to})` }], {
    duration,
    delay,
    easing: EASE,
    fill: "both",
  });
}

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

/** the animations' end, or `ms` of wall-clock time, whichever comes first */
function settle(anims: Animation[], ms: number) {
  return Promise.race([Promise.all(anims.map((a) => a.finished)).then(() => undefined, () => undefined), wait(ms)]);
}

/** the load event and the fonts, then two frames to settle — capped */
function pageReady(cap: number) {
  const load =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }));
  const fonts = document.fonts ? document.fonts.ready.then(() => undefined) : Promise.resolve();
  const frames = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  return Promise.race([Promise.all([load, fonts]).then(frames), wait(cap)]);
}

/**
 * Once the page is on screen: not a background tab, not a prerender waiting
 * to be opened. Resolves true if it had to wait.
 */
function whenShown() {
  const doc = document as Document & { prerendering?: boolean };
  const on = () => doc.visibilityState === "visible" && !doc.prerendering;
  if (on()) return Promise.resolve(false);
  return new Promise<boolean>((resolve) => {
    const check = () => {
      if (!on()) return;
      doc.removeEventListener("visibilitychange", check);
      doc.removeEventListener("prerenderingchange", check);
      resolve(true);
    };
    doc.addEventListener("visibilitychange", check);
    doc.addEventListener("prerenderingchange", check);
  });
}

/**
 * Land on the part of the page the URL names — /#team, followed from another
 * page. The browser makes that jump while the page is still arriving, before
 * the pins and the art give it its full height, so by the time the cover
 * lifts it can be screens short. A fresh navigation only: after a reload or a
 * step back, the browser puts the reader back where they were, and that wins.
 */
function landOnHash() {
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (nav && nav.type !== "navigate") return;
  let target: HTMLElement | null = null;
  try {
    const id = decodeURIComponent(window.location.hash.slice(1));
    target = id ? document.getElementById(id) : null;
  } catch {
    /* a malformed hash names nothing */
  }
  if (!target) return;
  const lenis = getLenis();
  // Forced: Lenis is held still while the page is covered. Either way the
  // target's scroll margin is respected (Lenis reads it itself).
  if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
  else target.scrollIntoView();
}

/** phones get the menu's shorter timings */
function compact() {
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches || !window.matchMedia(MD).matches;
}

export default function PageWipe() {
  const root = useRef<HTMLDivElement>(null);
  const ink = useRef<HTMLDivElement>(null);
  const bone = useRef<HTMLDivElement>(null);
  const loader = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const box = root.current;
    const inkEl = ink.current;
    const boneEl = bone.current;
    const loaderEl = loader.current;
    const innerEl = inner.current;
    const markEl = mark.current;
    const countEl = count.current;
    if (!box || !inkEl || !boneEl || !loaderEl || !innerEl || !markEl || !countEl) return;
    const discs = [inkEl, boneEl];
    let leaving: Element | null = null;

    const cancel = (els: Element[]) => els.forEach((el) => el.getAnimations().forEach((a) => a.cancel()));

    /** close the discs into `into`, bone first, and hand the page back */
    const close = (into: Element | null) => {
      const o = originOf(into);
      const m = compact();
      cancel(discs);
      discs.forEach((d) => place(d, o));
      const a = scale(boneEl, 1, 0, m ? 420 : 680, 120);
      const b = scale(inkEl, 1, 0, m ? 450 : 700, 220);

      // the discs' own animations hold the cover from here, so the covered
      // state can go — and with it the scroll lock and the entrances' wait
      html.dataset.wiping = "true";
      delete html.dataset.wipe;
      getLenis()?.start();
      window.dispatchEvent(new Event(OPEN_EVENT));

      settle([a, b], (m ? 450 : 700) + 220 + 400).then(() => {
        cancel([...discs, innerEl, markEl, countEl, ...loaderEl.querySelectorAll("[data-bit]")]);
        innerEl.style.removeProperty("--p");
        box.style.removeProperty("animation");
        box.style.pointerEvents = "";
        delete html.dataset.wiping;
      });
    };

    /** hand the page back at once, without the wipe */
    const release = () => {
      window.__booCount?.stop();
      cancel(discs);
      delete html.dataset.wipe;
      getLenis()?.start();
      box.style.removeProperty("animation");
      box.style.pointerEvents = "";
      window.dispatchEvent(new Event(OPEN_EVENT));
    };

    /** the preloader: count to 100 once the page is ready, see the loader off, open */
    const arrive = async () => {
      const mode = html.dataset.wipe; // load | reload | arrive
      const count = window.__booCount;
      getLenis()?.stop();
      box.style.pointerEvents = "auto";

      // The failsafe in globals.css fades the cover out in case this never
      // runs. If it has started to, tidy up without bringing the cover back.
      // If not, stand it down: from here this opens the cover, and it waits
      // for the page to be on screen to do it, which a timer can't know about.
      const failsafe = box
        .getAnimations()
        .find((a) => (a as CSSAnimation).animationName === "wipe-failsafe");
      const delay = Number(failsafe?.effect?.getComputedTiming().delay ?? 0);
      if (failsafe && Number(failsafe.currentTime ?? 0) >= delay) return release();
      box.style.animation = "none";

      // the count carries on creeping while the page gets ready
      void count?.go(90, 2600);

      // Nothing is timed until the page is on screen. A tab opened in the
      // background, or a page the browser prerendered, would otherwise spend
      // its preloader where nobody could see it.
      const origin = (await whenShown()) ? performance.now() : 0;
      const minEnd = origin + (mode === "load" ? 1900 : mode === "reload" ? 650 : 0);
      // and it doesn't hold the cover much past 7s on screen for a slow image
      const cap = Math.min(mode === "arrive" ? 2500 : 4500, Math.max(600, origin + 7000 - performance.now()));
      await pageReady(cap);
      await wait(Math.max(0, minEnd - performance.now()));

      const shown = mode !== "arrive" || +getComputedStyle(loaderEl).opacity > 0.05;
      if (shown) {
        // The rest of the way is counted too, a frame at a time. The cap is
        // for a device too starved to draw more than a few frames a second.
        if (count) await Promise.race([count.go(100, count.p > 85 ? 260 : 480), wait(2400)]);
        count?.stop();
        innerEl.style.setProperty("--p", "100");
        await wait(140);

        // the count drops out of its line, the labels go, the mark lifts away
        countEl.animate([{ transform: "translateY(0)" }, { transform: "translateY(108%)" }], {
          duration: 520,
          easing: EASE_IN,
          fill: "forwards",
        });
        loaderEl.querySelectorAll<HTMLElement>("[data-bit]").forEach((el) =>
          el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease", fill: "forwards" }),
        );
        markEl.animate(
          [
            { transform: "translateY(0) scale(1)", opacity: 1 },
            { transform: "translateY(-5%) scale(0.97)", opacity: 0 },
          ],
          { duration: 480, easing: EASE_IN, fill: "forwards" },
        );
        await wait(320);
      } else {
        count?.stop();
      }

      try {
        sessionStorage.setItem(STORAGE.seen, "1");
        sessionStorage.removeItem(STORAGE.wipe);
      } catch {
        /* storage blocked — every load just gets the full count */
      }
      // the page has its full height now, and is still covered
      landOnHash();
      close(document.querySelector("[data-wipe-origin]"));
    };

    if (html.dataset.wipe && !arrived) {
      arrived = true;
      // with the failsafe stood down, nothing else would lift the cover
      arrive().catch(release);
    }

    const leave = (href: string, from: Element) => {
      leaving = from;
      box.style.pointerEvents = "auto";
      html.dataset.wiping = "true";
      const hint = document.createElement("link");
      hint.rel = "prefetch";
      hint.href = href;
      document.head.appendChild(hint);

      const o = originOf(from);
      const m = compact();
      cancel(discs);
      discs.forEach((d) => place(d, o));
      const a = scale(inkEl, 0, 1, m ? 550 : 900);
      const b = scale(boneEl, 0, 1, m ? 520 : 860, m ? 80 : 150);
      settle([a, b], (m ? 600 : 1010) + 350).then(() => {
        try {
          sessionStorage.setItem(STORAGE.wipe, String(Date.now()));
        } catch {
          /* storage blocked — the next page just won't play its half */
        }
        window.location.assign(href);
      });
    };

    const onClick = (e: MouseEvent) => {
      // anything asking for a new tab, or already handled, is left alone
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      // only between pages of this site — in-page anchors scroll as before
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (prefersReducedMotion()) return;
      e.preventDefault();
      if (!leaving) leave(url.href, a);
    };

    // Back to a page kept in the back/forward cache: it comes back covered,
    // exactly as it was left, so it opens again into what was clicked.
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted || !leaving) return;
      const from = leaving;
      leaving = null;
      if (prefersReducedMotion()) {
        cancel(discs);
        box.style.pointerEvents = "";
        delete html.dataset.wiping;
      } else {
        close(from);
      }
    };

    document.addEventListener("click", onClick);
    window.addEventListener("pageshow", onPageShow);
    // Listeners only. The arrival is left to finish: React runs effects twice
    // in development, and the second run must not undo the first's work.
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return (
    <div ref={root} data-page-wipe aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      <div ref={ink} className="wipe-disc bg-ink" />
      <div ref={bone} className="wipe-disc bg-bone" />

      <div ref={loader} className="preloader absolute inset-0">
        {/* the count is on this element's style before React arrives */}
        <div
          ref={inner}
          suppressHydrationWarning
          className="preloader-inner absolute inset-0 flex flex-col justify-between px-[var(--edge)] py-[clamp(1.25rem,3.4vh,2.25rem)] text-ink"
        >
          <div className="flex items-start justify-between gap-6">
            <p data-bit className="label label-loose flex items-center gap-3 text-ink/60">
              <span className="h-[0.42rem] w-[0.42rem] shrink-0 rotate-45 bg-lime" />
              {EVENT.date}
            </p>
            <p data-bit className="label label-loose text-right text-ink/60">
              {EVENT.venue}
            </p>
          </div>

          {/* the wordmark, filling with ink from the bottom as the page loads */}
          <div
            ref={mark}
            className="relative mx-auto w-[clamp(12rem,36vw,26rem)]"
            style={{ aspectRatio: "1475 / 657" }}
          >
            <Image
              src="/assets/wordmark.webp"
              alt=""
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 767px) 60vw, 26rem"
              className="object-contain opacity-[0.12]"
            />
            <div className="preloader-fill absolute inset-0">
              <Image
                src="/assets/wordmark.webp"
                alt=""
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 767px) 60vw, 26rem"
                className="object-contain"
              />
            </div>
          </div>

          <div className="flex items-end justify-between gap-6">
            <div className="overflow-hidden">
              <p
                ref={count}
                className="preloader-count display flex items-start text-[clamp(4.5rem,15vw,11.5rem)] leading-[0.82] tabular-nums tracking-[-0.04em]"
              >
                <span className="label ml-2 mt-[0.4em] text-[0.8rem] text-ink/50">%</span>
              </p>
            </div>
            <p data-bit className="label label-loose hidden max-w-[24ch] text-right leading-[1.9] text-ink/50 md:block">
              {EVENT.format}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
