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
import SocialIcon from "@/components/ui/SocialIcon";
import BouncyWord from "@/components/ui/BouncyWord";

/**
 * The menu is cut out of a blob that grows from the trigger. The path is a unit
 * shape around the origin and GSAP scales it about the trigger's own pixel
 * position, so the wipe lands in the right corner at any viewport size.
 */
const CLIP_INK =
  "M0.864 -0.046C0.83 0.155 0.79 0.39 0.688 0.553C0.585 0.716 0.469 0.875 0.25 0.934C0.03 0.992 -0.443 1.017 -0.629 0.905C-0.815 0.794 -0.827 0.469 -0.866 0.264C-0.906 0.06 -0.93 -0.158 -0.866 -0.322C-0.802 -0.486 -0.648 -0.584 -0.481 -0.72C-0.314 -0.856 -0.094 -1.149 0.134 -1.137C0.363 -1.126 0.769 -0.835 0.891 -0.653C1.012 -0.471 0.898 -0.247 0.864 -0.046Z";
const CLIP_BONE =
  "M1.054 -0.005C1.032 0.223 0.786 0.432 0.654 0.587C0.521 0.741 0.451 0.856 0.258 0.922C0.064 0.988 -0.302 1.082 -0.509 0.981C-0.716 0.88 -0.905 0.542 -0.985 0.317C-1.065 0.091 -1.06 -0.184 -0.987 -0.372C-0.914 -0.56 -0.733 -0.685 -0.549 -0.812C-0.364 -0.938 -0.1 -1.136 0.122 -1.132C0.343 -1.127 0.628 -0.972 0.783 -0.785C0.938 -0.597 1.075 -0.234 1.054 -0.005Z";

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
  { wdth: 125, size: 1.34, indent: 5.4, tilt: -1.4 }, // Build
  { wdth: 125, size: 1.5, indent: 7.5, tilt: 1.8 },  // FAQ
];

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

export default function FullscreenNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const ink = useRef<SVGPathElement>(null);
  const bone = useRef<SVGPathElement>(null);
  const items = useRef<HTMLLIElement[]>([]);
  const aside = useRef<HTMLDivElement>(null);
  const cat = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const first = useRef(true);

  // open / close
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const { x, y, radius } = wipe();
    // the blob is a unit shape at the origin: park it on the trigger, then
    // only its scale ever animates
    const at = { x, y, transformOrigin: "50% 50%" };
    const shut = { ...at, scale: 0.0001 };
    const wide = { ...at, scale: radius };

    if (first.current) {
      first.current = false;
      if (!open) {
        gsap.set([ink.current, bone.current], shut);
        gsap.set(el, { autoAlpha: 0 });
        return;
      }
    }

    document.body.dataset.lock = String(open);
    document.documentElement.dataset.nav = open ? "open" : "closed";
    const targets = items.current.filter(Boolean);
    const chars = targets.flatMap((li) => [...li.querySelectorAll<HTMLElement>("[data-char]")]);
    const numbers = targets.flatMap((li) => [...li.querySelectorAll<HTMLElement>("[data-nav-index]")]);
    gsap.killTweensOf([ink.current, bone.current, targets, chars, numbers, aside.current, cat.current]);

    if (reduced) {
      gsap.set(el, { autoAlpha: open ? 1 : 0 });
      gsap.set([ink.current, bone.current], open ? wide : shut);
      gsap.set([targets, chars, numbers, aside.current, cat.current], {
        autoAlpha: open ? 1 : 0, x: 0, y: 0, yPercent: 0, rotate: 0,
      });
      return;
    }

    if (open) {
      const tl = gsap.timeline();
      tl.set(el, { autoAlpha: 1 })
        .fromTo(ink.current, shut, { ...wide, duration: 1, ease: "power3.inOut" })
        .fromTo(bone.current, shut, { ...wide, duration: 0.95, ease: "power3.inOut" }, 0.17)
        .set(targets, { autoAlpha: 1 })
        // y as well as yPercent: closing lifts the letters with `y`, and an
        // open that only resets `yPercent` leaves every letter 18px high from
        // the second time the menu is used onwards
        .fromTo(
          chars,
          { yPercent: 155, y: 0, rotate: (i: number) => (i % 2 ? 9 : -9), autoAlpha: 0 },
          {
            yPercent: 0,
            y: 0,
            rotate: 0,
            autoAlpha: 1,
            duration: 0.78,
            ease: "back.out(1.5)",
            stagger: { each: 0.016 },
          },
          0.44,
        )
        .fromTo(
          numbers,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" },
          0.72,
        )
        .fromTo(
          cat.current,
          { yPercent: 44, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.95, ease: "back.out(1.5)" },
          0.6,
        )
        .fromTo(aside.current, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.74);
    } else {
      const tl = gsap.timeline({ onComplete: () => gsap.set(el, { autoAlpha: 0 }) });
      tl.to([chars, numbers, aside.current], { autoAlpha: 0, y: -18, duration: 0.28, stagger: { each: 0.006 }, ease: "power2.in" })
        .to(cat.current, { yPercent: 38, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 0)
        .to(bone.current, { ...shut, duration: 0.68, ease: "power3.inOut" }, 0.1)
        .to(ink.current, { ...shut, duration: 0.7, ease: "power3.inOut" }, 0.2);
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
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <clipPath id="nav-clip-ink" clipPathUnits="userSpaceOnUse">
            <path ref={ink} d={CLIP_INK} />
          </clipPath>
          <clipPath id="nav-clip-bone" clipPathUnits="userSpaceOnUse">
            <path ref={bone} d={CLIP_BONE} />
          </clipPath>
        </defs>
      </svg>

      {/* ink leads, off-white follows — one organic shape opening across the page */}
      <div className="absolute inset-0 bg-ink" style={{ clipPath: "url(#nav-clip-ink)" }} />

      <div
        className="absolute inset-0 overflow-hidden bg-bone"
        style={{ clipPath: "url(#nav-clip-bone)" }}
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
