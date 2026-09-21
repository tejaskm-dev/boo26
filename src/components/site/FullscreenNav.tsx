"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { NavBase, NavLedge } from "./NavField";
import PeekingCat from "@/components/cat/PeekingCat";
import CloseButton from "@/components/ui/CloseButton";
import BlobButton from "@/components/ui/BlobButton";
import Wordmark from "@/components/ui/Wordmark";
import { GlowEyes, Sparkle } from "@/components/ui/Glyphs";
import { EVENT, NAV, SOCIALS } from "@/lib/site";
import { prefersReducedMotion } from "@/lib/motion";
import { getLenis } from "@/lib/lenis";
import SocialIcon from "@/components/ui/SocialIcon";
import BouncyWord from "@/components/ui/BouncyWord";

/**
 * The menu is cut out of a blob that grows from the trigger. The shape is drawn
 * around the origin and GSAP scales it about the trigger's own pixel position,
 * so the wipe lands in the right corner at any viewport size.
 *
 * The geometry is drawn at a thousand units rather than one, and the animated
 * scale is divided to match. Same motion — but at the closed end of the wipe
 * the path's coordinates sit near 0.1 user units instead of 0.0001, which is
 * the difference between a clean edge and the torn one the rasteriser produces
 * when it runs out of precision.
 */
/**
 * Build the CSS circle() clip-path string for a given radius.
 * origin is expressed in px for the open state and 0px for the closed state.
 */
function circleClip(r: number, x: number, y: number) {
  return `circle(${r}px at ${x}px ${y}px)`;
}

/** where the blob starts from, and how big it has to get to cover the page */
function wipe() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const trigger = document.querySelector(".menu-trigger")?.getBoundingClientRect();
  const ox = trigger ? trigger.left + trigger.width / 2 : w * 0.93;
  const oy = trigger ? trigger.top + trigger.height / 2 : h * 0.07;
  const reach = Math.max(ox, w - ox) ** 2 + Math.max(oy, h - oy) ** 2;
  return { x: ox, y: oy, radius: Math.sqrt(reach) * 1.45 };
}

/**
 * Each item is set differently — width axis, size and indent — so the index
 * reads as a composition rather than a menu.
 *
 * One entry per label, in order, because the setting has to answer the word:
 * the big wide cuts go to the short labels and the long ones are set narrow
 * and smaller, which is what keeps every line inside the off-white field
 * instead of running out into the ink.
 */
const ITEM = [
  { wdth: 118, size: 1.1, indent: 0, tilt: -1.9 },   // The Night
  { wdth: 86, size: 0.9, indent: 2.6, tilt: 1.3 },   // Experience
  { wdth: 112, size: 1.05, indent: 0.9, tilt: -0.7 }, // 20 Hours
  { wdth: 88, size: 0.92, indent: 3, tilt: 2.3 },    // After Dark
  { wdth: 96, size: 0.82, indent: 4.2, tilt: -1.1 }, // The People
  { wdth: 125, size: 1.2, indent: 5.4, tilt: -1.4 }, // Build
  { wdth: 125, size: 1.5, indent: 7.5, tilt: 1.8 },  // FAQ
];

export default function FullscreenNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const inkDiv = useRef<HTMLDivElement>(null);
  const boneDiv = useRef<HTMLDivElement>(null);
  const items = useRef<HTMLLIElement[]>([]);
  const aside = useRef<HTMLDivElement>(null);
  const cat = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const first = useRef(true);
  // true on touch/low-DPR devices — prefer simpler animations
  const isMobile = useRef(false);
  useEffect(() => {
    isMobile.current =
      window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
      window.innerWidth < 768;
  }, []);

  // open / close
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const { x, y, radius } = wipe();

    // CSS clip-path: circle() — GPU composited on all modern browsers.
    // A 0px circle at the trigger origin is invisible; radius * 1px fills the viewport.
    const clipShut = circleClip(0, x, y);
    const clipWide = circleClip(radius, x, y);
    const inkEl = inkDiv.current;
    const boneEl = boneDiv.current;

    if (first.current) {
      first.current = false;
      if (!open) {
        if (inkEl) inkEl.style.clipPath = clipShut;
        if (boneEl) boneEl.style.clipPath = clipShut;
        gsap.set(el, { autoAlpha: 0 });
        return;
      }
    }

    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();

    document.body.dataset.lock = String(open);
    document.documentElement.dataset.nav = open ? "open" : "closed";
    const targets = items.current.filter(Boolean);
    const chars = targets.flatMap((li) => [...li.querySelectorAll<HTMLElement>("[data-char]")]);
    const numbers = targets.flatMap((li) => [...li.querySelectorAll<HTMLElement>("[data-nav-index]")]);
    gsap.killTweensOf([inkEl, boneEl, targets, chars, numbers, aside.current, cat.current]);

    if (reduced) {
      gsap.set(el, { autoAlpha: open ? 1 : 0 });
      if (inkEl) inkEl.style.clipPath = open ? clipWide : clipShut;
      if (boneEl) boneEl.style.clipPath = open ? clipWide : clipShut;
      gsap.set([targets, chars, numbers, aside.current, cat.current], {
        autoAlpha: open ? 1 : 0, x: 0, y: 0, yPercent: 0, rotate: 0,
      });
      return;
    }

    // Animate clip-path via GSAP on the element's style — browsers promote
    // clip-path: circle() to the compositor, so this runs on the GPU thread.
    const mobile = isMobile.current;
    // shorter durations + simpler stagger on mobile to stay in frame budget
    const wipeDur = mobile ? 0.55 : 1.0;
    const boneDelay = mobile ? 0.08 : 0.17;
    const charDur = mobile ? 0.5 : 0.78;
    const charStagger = mobile ? 0.022 : 0.016;
    const charStart = mobile ? 0.3 : 0.44;

    if (open) {
      const tl = gsap.timeline();
      tl.set(el, { autoAlpha: 1 })
        // animate clipPath string directly — GSAP interpolates the numeric radius
        .fromTo(
          inkEl,
          { clipPath: clipShut },
          { clipPath: clipWide, duration: wipeDur, ease: "power3.inOut" },
        )
        .fromTo(
          boneEl,
          { clipPath: clipShut },
          { clipPath: clipWide, duration: wipeDur * 0.95, ease: "power3.inOut" },
          boneDelay,
        )
        .set(targets, { autoAlpha: 1 })
        .fromTo(
          chars,
          { yPercent: 155, y: 0, rotate: (i: number) => (i % 2 ? 9 : -9), autoAlpha: 0 },
          {
            yPercent: 0,
            y: 0,
            rotate: 0,
            autoAlpha: 1,
            duration: charDur,
            ease: "back.out(1.5)",
            stagger: { each: charStagger },
          },
          charStart,
        )
        .fromTo(
          numbers,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" },
          charStart + 0.28,
        )
        .fromTo(
          cat.current,
          { yPercent: mobile ? 20 : 44, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: mobile ? 0.55 : 0.95, ease: "back.out(1.5)" },
          charStart + 0.16,
        )
        .fromTo(aside.current, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.7 }, charStart + 0.3);
    } else {
      const tl = gsap.timeline({ onComplete: () => gsap.set(el, { autoAlpha: 0 }) });
      const closeDur = mobile ? 0.22 : 0.28;
      tl.to([chars, numbers, aside.current], { autoAlpha: 0, y: -18, duration: closeDur, stagger: { each: 0.006 }, ease: "power2.in" })
        .to(cat.current, { yPercent: mobile ? 20 : 38, autoAlpha: 0, duration: closeDur + 0.07, ease: "power2.in" }, 0)
        .to(boneEl, { clipPath: clipShut, duration: mobile ? 0.42 : 0.68, ease: "power3.inOut" }, closeDur * 0.4)
        .to(inkEl, { clipPath: clipShut, duration: mobile ? 0.45 : 0.7, ease: "power3.inOut" }, closeDur * 0.4 + 0.1);
    }
  }, [open]);

  /**
   * Hover response — the letters lift in a wave, the rest of the index steps
   * back.
   *
   * Only the two rows whose state actually changed are re-tweened. Running the
   * whole index on every pointer move restarted five staggered letter tweens
   * mid-flight, and a stagger that restarts at a different phase reads as a
   * jitter. `overwrite` finishes the job: crossing rows quickly can queue a
   * leave and an enter in the same frame, and without it both would play.
   */
  const prevHover = useRef<number | null>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const targets = items.current.filter(Boolean);
    if (!targets.length) return;

    const was = prevHover.current;
    prevHover.current = hovered;
    // a row only moves if it just gained or lost the pointer; the rest are
    // only dimmed, which is a single cheap tween on the row itself
    const touched = new Set<number>();
    if (was !== null) touched.add(was);
    if (hovered !== null) touched.add(hovered);

    targets.forEach((li, i) => {
      const on = hovered === i;

      if (touched.has(i)) {
        const chars = li.querySelectorAll<HTMLElement>("[data-char]");
        gsap.to(chars, {
          yPercent: on ? -13 : 0,
          scale: on ? 1.05 : 1,
          duration: on ? 0.42 : 0.5,
          ease: on ? "back.out(3)" : "power3.out",
          stagger: { each: on ? 0.021 : 0.012, from: "start" },
          overwrite: "auto",
        });
        const index = li.querySelector<HTMLElement>("[data-nav-index]");
        if (index) {
          gsap.to(index, {
            color: on ? "var(--color-lime)" : "",
            y: on ? -4 : 0,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      }

      gsap.to(li, {
        opacity: hovered === null || on ? 1 : 0.32,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    gsap.to(cat.current, {
      x: hovered === null ? 0 : -18,
      rotate: hovered === null ? 0 : -2.5,
      duration: 0.7,
      ease: "power3.out",
      overwrite: "auto",
    });
  }, [hovered]);

  // escape to close, and focus handling
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const timer = setTimeout(() => {
      root.current?.querySelector<HTMLElement>("[data-nav-first]")?.focus();
    }, 620);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(timer);
    };
  }, [open, onClose]);

  useEffect(
    () => () => {
      delete document.body.dataset.lock;
      delete document.documentElement.dataset.nav;
      getLenis()?.start();
    },
    [],
  );

  return (
    <div
      ref={root}
      id="site-nav"
      className="invisible fixed inset-0 z-[70]"
      aria-hidden={!open}
      inert={!open}
    >
      {/* CSS circle clip-path wipe — GPU composited, zero SVG rasterise overhead */}
      <div
        ref={inkDiv}
        className="absolute inset-0 bg-ink will-change-[clip-path]"
        style={{ clipPath: "circle(0px at 95% 5%)" }}
      />

      <div
        ref={boneDiv}
        className="absolute inset-0 overflow-hidden bg-bone will-change-[clip-path]"
        style={{ clipPath: "circle(0px at 95% 5%)" }}
      >
        <NavBase />

        <PeekingCat
          ref={cat}
          excited={hovered !== null}
          className="pointer-events-none absolute right-[1%] top-[9%] w-[46vw] max-w-[32rem] md:right-[10%] md:top-[21%] md:w-[34vw]"
        />
        <NavLedge className="pointer-events-none" />

        <GlowEyes
          className="pointer-events-none absolute bottom-[22%] right-[36%] hidden w-[8vw] max-w-[118px] md:block"
          glowId="nav-eyes"
        />
        <Sparkle className="pointer-events-none absolute bottom-[30%] left-[6%] w-[clamp(1.15rem,2vw,2rem)] text-lime md:bottom-[14%] md:left-[7%]" />
        <Sparkle className="pointer-events-none absolute right-[5%] top-[66%] hidden w-[clamp(1rem,1.5vw,1.6rem)] text-lime md:block" />

        {/* chrome */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between px-[var(--edge)] py-[clamp(1rem,2.2vw,1.9rem)]">
          <Wordmark />
          <CloseButton onClick={onClose} className="text-ink md:text-bone" />
        </div>

        {/* the index */}
        <nav className="absolute inset-x-0 top-[47%] -translate-y-1/2 px-[var(--edge)] md:pl-[7vw]">
          <ul className="flex flex-col items-start gap-[clamp(0.1rem,0.7vh,0.7rem)]">
            {NAV.map((item, i) => {
              const art = ITEM[i % ITEM.length];
              return (
                <li
                  key={item.href}
                  ref={(n) => { if (n) items.current[i] = n; }}
                  style={{ marginLeft: `${art.indent}vw`, rotate: `${art.tilt}deg` }}
                  onPointerEnter={() => setHovered(i)}
                  onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
                >
                  <a
                    href={item.href}
                    onClick={onClose}
                    aria-label={item.label}
                    data-nav-first={i === 0 ? "" : undefined}
                    className="group relative flex items-start gap-[0.3em] outline-none"
                  >
                    {/* the mask the letters rise out of. clip-path rather than
                        overflow, so the line box is untouched and the tilt on
                        each letter still has room above the cap line */}
                    <span
                      className="relative z-10 block leading-[1]"
                      style={{
                        fontSize: `calc(clamp(2.35rem, 10.4vw, 4.3rem) * ${art.size})`,
                        clipPath: "inset(-0.44em -0.9em -0.32em -0.34em)",
                      }}
                    >
                      {/* a marker stroke swipes in behind the word */}
                      <svg
                        viewBox="0 0 200 40"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                        className="pointer-events-none absolute top-[17%] h-[64%] -left-[0.1em] w-[calc(100%+0.2em)] origin-left scale-x-0 -rotate-[0.8deg] text-lime transition-transform duration-[520ms] ease-[var(--ease-out-soft)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                      >
                        <path
                          d="M6 24C44 12 70 28 108 18C146 8 170 26 196 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={30}
                          strokeLinecap="round"
                        />
                      </svg>

                      <span
                        className="display relative block whitespace-nowrap"
                        style={{ fontVariationSettings: `"wdth" ${art.wdth}` }}
                      >
                        <BouncyWord text={item.label} seed={i + 1} amount={1.25} />
                      </span>
                    </span>

                    <span
                      data-nav-index
                      className="label relative z-10 mt-[0.9em] text-ink/40 transition-colors duration-300"
                    >
                      {item.index}
                    </span>

                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* aside */}
        <div
          ref={aside}
          className="absolute inset-x-0 bottom-0 flex flex-col gap-6 px-[var(--edge)] pb-[clamp(1.4rem,3.4vh,2.6rem)] md:flex-row md:items-end md:justify-between"
        >
          <ul className="flex items-center gap-5 md:gap-6">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  className="block text-ink/55 outline-none transition-colors duration-300 hover:text-lime focus-visible:text-lime md:text-bone/65"
                >
                  <SocialIcon name={s.icon} className="h-[1.05rem] w-[1.05rem]" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-start gap-4 md:items-end md:gap-5">
            <p className="label flex flex-col gap-1.5 whitespace-nowrap text-ink/70 md:label-loose md:items-end md:gap-2 md:text-bone/80">
              <span>{EVENT.date}</span>
              <span>{EVENT.venue}</span>
            </p>
            <BlobButton href={EVENT.registerHref} onClick={onClose}>
              Register now
            </BlobButton>
          </div>
        </div>
      </div>
    </div>
  );
}
