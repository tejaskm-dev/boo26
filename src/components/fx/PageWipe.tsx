"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { EVENT } from "@/lib/site";
import { MD, OPEN_EVENT, prefersReducedMotion } from "@/lib/motion";
import { getLenis } from "@/lib/lenis";

/**
 * The page wipe, and the preloader it doubles as.
 *
 * Leaving: a link to another page of the site grows two discs out of whatever
 * was clicked — ink, then bone a beat behind, the fullscreen menu's wipe — and
 * the browser only navigates once the screen is covered. The next page is
 * prefetched while that plays.
 *
 * Arriving, and on every load: the inline script in the layout covers the page
 * before its first paint. The cover is the preloader — the wordmark filling
 * with ink and a count to 100 — and once the page is actually ready (fonts,
 * the images the load event waits on, a couple of settled frames) the discs
 * close, bone first, into the control that leads back ([data-wipe-origin]).
 * Entrances wait for that (see whenOpen), so they play where they're seen.
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
const FLAG = "boo:wipe"; // left by a page on its way out, read by the next one's inline script
const SEEN = "boo:seen"; // the full count plays once a visit
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)"; // GSAP's power3.inOut — the menu's wipe
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)"; // --ease-out-soft
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

/** phones get the menu's shorter timings */
function compact() {
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches || !window.matchMedia(MD).matches;
}

function readP(el: HTMLElement) {
  return parseInt(getComputedStyle(el).getPropertyValue("--p"), 10) || 0;
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
        box.style.pointerEvents = "";
        delete html.dataset.wiping;
      });
    };

    /** the preloader: count to 100 once the page is ready, see the loader off, open */
    const arrive = async () => {
      const mode = html.dataset.wipe; // load | reload | arrive
      getLenis()?.stop();
      box.style.pointerEvents = "auto";

      // The failsafe in globals.css fades the cover out at 7s in case this
      // never runs. If it already has, tidy up without bringing it back.
      if (performance.now() > 6500) {
        cancel(discs);
        delete html.dataset.wipe;
        getLenis()?.start();
        box.style.pointerEvents = "";
        window.dispatchEvent(new Event(OPEN_EVENT));
        return;
      }

      // take the count over from the CSS creep, carrying on from where it is
      let p = readP(innerEl);
      innerEl.style.setProperty("--p", String(p));
      innerEl.style.animation = "none";
      const creep = innerEl.animate([{ "--p": p }, { "--p": 90 }], {
        duration: 2600,
        easing: "cubic-bezier(0.2, 0.6, 0.3, 1)",
        fill: "forwards",
      });

      const minEnd = mode === "load" ? 1900 : mode === "reload" ? 650 : 0;
      await pageReady(mode === "arrive" ? 2500 : 4500);
      await wait(Math.max(0, minEnd - performance.now()));

      const shown = mode !== "arrive" || +getComputedStyle(loaderEl).opacity > 0.05;
      if (shown) {
        p = readP(innerEl);
        innerEl.style.setProperty("--p", String(p));
        creep.cancel();
        const finish = innerEl.animate([{ "--p": p }, { "--p": 100 }], {
          duration: p > 85 ? 260 : 480,
          easing: EASE_OUT,
          fill: "forwards",
        });
        await settle([finish], 800);
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
        creep.cancel();
      }

      try {
        sessionStorage.setItem(SEEN, "1");
        sessionStorage.removeItem(FLAG);
      } catch {
        /* storage blocked — every load just gets the full count */
      }
      close(document.querySelector("[data-wipe-origin]"));
    };

    if (html.dataset.wipe && !arrived) {
      arrived = true;
      void arrive();
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
          sessionStorage.setItem(FLAG, String(Date.now()));
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
        <div
          ref={inner}
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
