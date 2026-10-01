"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section, { SectionLabel } from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import GhostIndex from "@/components/ui/GhostIndex";
import { GlowEyes } from "@/components/ui/Glyphs";
import Words from "@/components/fx/Words";
import Critters from "./Critters";
import { TREE } from "./tree";
import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/motion";
import { subscribePointer } from "@/lib/pointer";
import type { SpriteName } from "@/lib/sprites";
import { SOON, TROLL } from "@/lib/soon";
import { answer, buzz, shiver, troll } from "./troll";

/** Where the eyes can be, as fractions of the room, and where they end up. */
const SPOTS: [number, number][] = [
  [0.8, 0.17],
  [0.17, 0.3],
  [0.87, 0.43],
  [0.34, 0.52],
  [0.72, 0.65],
  [0.14, 0.72],
];
const FINAL: [number, number] = [0.5, 0.875];
const SWEETS: SpriteName[] = ["candy", "lollipop", "candy-corn"];

/** A line that only exists inside the torch beam. */
function Whisper({ children, className = "" }: { children: string; className?: string }) {
  return (
    <p className={`hand pointer-events-none absolute whitespace-pre-line text-[clamp(1rem,1.5vw,1.35rem)] leading-[1.15] text-bone/60 ${className}`}>
      {children}
    </p>
  );
}

/**
 * 02 — the room BOO! is being set up in, with the lights off.
 *
 * The section goes almost black and a torch follows you: the cursor on a
 * laptop; on a phone, tilting it, dragging the torch at the bottom of the
 * screen, or tapping where to look — and if none of those, the beam sweeps
 * the room as you scroll, so nothing is missed. What it finds is fragments,
 * never a picture: a door, a clock with no hands, things you were told not to
 * touch. A pair of eyes is the only thing lit without it, and they don't like
 * being looked at. Now and then the torch cuts out; when it comes back,
 * something has moved.
 *
 * The dark is one layer fixed to the screen and clipped to the room, and the
 * torch moves it on the compositor — see .soon-beam in soon.css. With motion
 * turned down, or no script, there's no dark at all: the room is just dim,
 * and everything in it can be read.
 */
export default function InTheDark() {
  const t = SOON.dark;
  const room = useRef<HTMLDivElement>(null);
  const beam = useRef<HTMLDivElement>(null);
  const eyes = useRef<HTMLSpanElement>(null);
  const cam = useRef<HTMLSpanElement>(null);
  const tv = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLButtonElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const strikeRef = useRef<() => void>(() => {});
  const pumpkin = useRef(false);

  const [door, setDoor] = useState<"shut" | "asking" | "smashed">("shut");
  const [sweet, setSweet] = useState<SpriteName | null>(null);
  const [ghostUp, setGhostUp] = useState(false);
  const knocks = useRef<number[]>([]);

  useEffect(() => {
    const el = room.current;
    const beamEl = beam.current;
    const eyesEl = eyes.current;
    const camEl = cam.current;
    if (!el || !beamEl || !eyesEl || prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    el.dataset.torch = "on";

    const scrollY = () => getLenis()?.scroll ?? window.scrollY;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Geometry, measured when the layout changes — never while scrolling.
    let top = 0;
    let left = 0;
    let width = 1;
    let height = 1;
    let reach = 120;
    let camX = 0;
    let camY = 0;
    const measure = () => {
      const r = el.getBoundingClientRect();
      top = r.top + scrollY();
      left = r.left;
      width = r.width;
      height = r.height;
      reach = beamEl.offsetWidth * 0.3;
      if (camEl) {
        const c = camEl.getBoundingClientRect();
        camX = c.left + c.width * 0.72;
        camY = c.top + scrollY() + c.height * 0.4;
      }
      placeEyes();
    };

    // --- the eyes ---------------------------------------------------------
    let spot = 0;
    let fleeing = false;
    let settled = false;
    const eyesAt = (): [number, number] => {
      const [fx, fy] = settled ? FINAL : SPOTS[spot];
      return [fx * width, fy * height];
    };
    function placeEyes() {
      const [x, y] = eyesAt();
      eyesEl!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }

    // --- the torch ---------------------------------------------------------
    const bx = gsap.quickTo(beamEl, "x", { duration: 0.32, ease: "power3.out" });
    const by = gsap.quickTo(beamEl, "y", { duration: 0.32, ease: "power3.out" });
    const turn = camEl ? gsap.quickTo(camEl, "rotation", { duration: 0.9, ease: "power3.out" }) : null;
    let beamX = window.innerWidth / 2;
    let beamY = window.innerHeight / 2;
    bx(beamX);
    by(beamY);

    const look = () => {
      // the camera watches the light
      if (turn) {
        const a = (Math.atan2(beamY - (camY - scrollY()), beamX - camX) * 180) / Math.PI;
        turn(Math.max(-48, Math.min(22, ((a - 180 + 540) % 360) - 180)));
      }
      // and the eyes don't like it
      if (fleeing || settled) return;
      const [x, y] = eyesAt();
      if (Math.hypot(left + x - beamX, top + y - scrollY() - beamY) > reach) return;
      fleeing = true;
      eyesEl.dataset.shut = "true";
      window.setTimeout(() => {
        let best = spot;
        let far = -1;
        SPOTS.forEach(([fx, fy], i) => {
          if (i === spot) return;
          const d = Math.hypot(left + fx * width - beamX, top + fy * height - scrollY() - beamY);
          if (d > far) {
            far = d;
            best = i;
          }
        });
        spot = best;
        placeEyes();
        window.setTimeout(() => {
          delete eyesEl.dataset.shut;
          fleeing = false;
        }, 200);
      }, 240);
    };

    const aim = (x: number, y: number) => {
      beamX = x;
      beamY = y;
      bx(x);
      by(y);
      look();
    };

    // --- what moves it ----------------------------------------------------
    let active = false;
    let manualUntil = 0;
    let tilted = false;

    // the cursor on a laptop; tilt on a phone (src/lib/pointer.ts)
    const unsub = subscribePointer((nx, ny) => {
      if (!active) return;
      if (!fine) {
        tilted = true;
        if (Date.now() < manualUntil) return;
      }
      aim(((nx + 1) / 2) * window.innerWidth, ((ny + 1) / 2) * window.innerHeight);
    });

    // tap where to look
    let downX = 0;
    let downY = 0;
    const onDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || !active) return;
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 10) return;
      if ((e.target as Element).closest(".soon-handle")) return;
      manualUntil = Date.now() + 5000;
      aim(e.clientX, e.clientY);
    };
    el.addEventListener("pointerdown", onDown, { passive: true });
    el.addEventListener("pointerup", onUp, { passive: true });

    // hold the torch and point it — the handle is the only thing that stops
    // the page scrolling, and only while it's held
    let dragging = false;
    let travelled = 0;
    const handleEl = handle.current;
    const onHandleDown = (e: PointerEvent) => {
      dragging = true;
      travelled = 0;
      downX = e.clientX;
      downY = e.clientY;
      handleEl?.setPointerCapture(e.pointerId);
      manualUntil = Number.POSITIVE_INFINITY;
    };
    const onHandleMove = (e: PointerEvent) => {
      if (!dragging) return;
      travelled = Math.max(travelled, Math.hypot(e.clientX - downX, e.clientY - downY));
      if (travelled > 6) {
        if (el.dataset.torch === "off") el.dataset.torch = "on";
        aim(e.clientX, e.clientY - 40);
      }
    };
    const onHandleUp = () => {
      if (!dragging) return;
      dragging = false;
      manualUntil = Date.now() + 5000;
      if (travelled > 6) return;
      // a tap, not a drag: the switch
      if (el.dataset.torch === "off") {
        el.dataset.torch = "on";
      } else {
        el.dataset.torch = "off";
        answer(TROLL.brave);
      }
    };
    handleEl?.addEventListener("pointerdown", onHandleDown);
    handleEl?.addEventListener("pointermove", onHandleMove);
    handleEl?.addEventListener("pointerup", onHandleUp);
    handleEl?.addEventListener("pointercancel", onHandleUp);

    // --- as you go through the room ------------------------------------------
    let called = false;
    let flashed = false;
    const onScroll = () => {
      if (!active) return;
      const p = (scrollY() + window.innerHeight * 0.5 - top) / height;

      // nothing moving the torch: it sweeps the room with the scroll
      if (!fine && !tilted && Date.now() >= manualUntil) {
        aim(
          window.innerWidth * (0.5 + 0.36 * Math.sin(p * Math.PI * 3.2)),
          window.innerHeight * (0.46 + 0.1 * Math.cos(p * Math.PI * 2)),
        );
      } else {
        look();
      }

      if (!called && p > 0.42) {
        called = true;
        if (troll("calling", TROLL.calling, "Unknown")) window.setTimeout(() => answer(TROLL.inside, "Unknown"), 3400);
      }
      if (!settled && p > 0.78) {
        settled = true;
        delete eyesEl.dataset.shut;
        placeEyes();
      }
      if (!flashed && p > 0.9) {
        // the bulb comes on, once, and the whole room is there
        flashed = true;
        el.dataset.flash = "true";
        window.setTimeout(() => delete el.dataset.flash, 280);
      }
    };
    const lenis = getLenis();
    if (lenis) lenis.on("scroll", onScroll);
    else window.addEventListener("scroll", onScroll, { passive: true });

    // --- the torch has a mind of its own ---------------------------------------
    let flicker = 0;
    let dying = 0;
    let first = true;
    const scheduleFlicker = (soon = false) => {
      window.clearTimeout(flicker);
      flicker = window.setTimeout(doFlicker, soon ? 4800 + Math.random() * 1500 : 9000 + Math.random() * 6500);
    };
    function doFlicker() {
      if (!active || document.hidden || el!.dataset.torch !== "on") return scheduleFlicker();
      el!.dataset.flicker = "true";
      // in the long dark, the room rearranges itself
      window.setTimeout(() => {
        el!.dataset.moved = "true";
        if (pumpkin.current) el!.dataset.pumpkin = "gone";
        if (!settled && !fleeing) {
          spot = (spot + 3) % SPOTS.length;
          placeEyes();
        }
      }, 300);
      window.setTimeout(() => delete el!.dataset.flicker, 700);
      scheduleFlicker();
    }

    // Lightning, through the window: for a moment the dark lifts and the
    // branches outside are thrown across the wall. Two flashes in 0.8s,
    // inside the three-a-second limit.
    let thunder = 0;
    let lastStrike = 0;
    const strike = () => {
      const now = performance.now();
      if (now - lastStrike < 3500) return;
      lastStrike = now;
      shade.current?.animate(
        [{ opacity: 1 }, { opacity: 0.12, offset: 0.08 }, { opacity: 0.85, offset: 0.24 }, { opacity: 0.3, offset: 0.36 }, { opacity: 1 }],
        { duration: 820, easing: "ease-out" },
      );
      el.dataset.strike = "true";
      window.setTimeout(() => delete el.dataset.strike, 820);
    };
    strikeRef.current = strike;
    const scheduleStrike = () => {
      window.clearTimeout(thunder);
      thunder = window.setTimeout(() => {
        if (active && !document.hidden) strike();
        scheduleStrike();
      }, 15000 + Math.random() * 10000);
    };

    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
      el.dataset.active = active ? "true" : "false";
      if (!active) {
        window.clearTimeout(flicker);
        window.clearTimeout(dying);
        window.clearTimeout(thunder);
        return;
      }
      measure();
      scheduleFlicker(first);
      scheduleStrike();
      if (first) {
        first = false;
        const light = window.matchMedia("(prefers-color-scheme: light)").matches;
        troll("lights", light ? TROLL.lightMode : TROLL.darkMode);
      }
      window.clearTimeout(dying);
      dying = window.setTimeout(() => {
        if (!active || el.dataset.torch !== "on") return;
        if (!troll("dying", TROLL.dying)) return;
        el.dataset.torch = "dying";
        window.setTimeout(() => {
          if (el.dataset.torch === "dying") el.dataset.torch = "on";
        }, 2800);
      }, 30000);
    });
    io.observe(el);

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    ScrollTrigger.addEventListener("refresh", measure);
    measure();

    return () => {
      unsub();
      io.disconnect();
      ro.disconnect();
      ScrollTrigger.removeEventListener("refresh", measure);
      if (lenis) lenis.off("scroll", onScroll);
      else window.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      handleEl?.removeEventListener("pointerdown", onHandleDown);
      handleEl?.removeEventListener("pointermove", onHandleMove);
      handleEl?.removeEventListener("pointerup", onHandleUp);
      handleEl?.removeEventListener("pointercancel", onHandleUp);
      window.clearTimeout(flicker);
      window.clearTimeout(dying);
      window.clearTimeout(thunder);
      delete el.dataset.torch;
    };
  }, []);

  // --- the things you can poke ------------------------------------------------
  const blackout = (ms: number, then?: () => void) => {
    const el = room.current;
    if (!el || !el.dataset.torch) {
      then?.();
      return;
    }
    const was = el.dataset.torch;
    el.dataset.torch = "off";
    window.setTimeout(() => {
      el.dataset.torch = was === "off" ? "off" : "on";
      then?.();
    }, ms);
  };

  const knock = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (door !== "shut") return;
    shiver(e.currentTarget, 4);
    const now = Date.now();
    knocks.current = [...knocks.current.filter((k) => now - k < 2500), now];
    if (knocks.current.length >= 3) {
      knocks.current = [];
      setDoor("asking");
      answer("trick or treat?");
    }
  };

  const treat = () => {
    setSweet(SWEETS[Math.floor(Math.random() * SWEETS.length)]);
    setDoor("shut");
    answer(TROLL.treat);
  };

  const trick = () => {
    setDoor("shut");
    blackout(1100, () => {
      setDoor("smashed");
      shiver(room.current, 7);
      buzz(50);
      answer(TROLL.trick);
    });
  };

  const camera = () => {
    const screen = tv.current;
    if (!screen) return;
    screen.dataset.static = "loud";
    window.setTimeout(() => {
      screen.dataset.static = "me";
      answer(TROLL.camera);
      window.setTimeout(() => delete screen.dataset.static, 1900);
    }, 650);
  };

  const dance = (e: React.MouseEvent<HTMLButtonElement>) => {
    const art = e.currentTarget.firstElementChild as HTMLElement | null;
    if (art && !prefersReducedMotion()) {
      art.animate(
        [
          { rotate: "0deg", translate: "0 0" },
          { rotate: "-8deg", translate: "0 -5%" },
          { rotate: "8deg", translate: "0 0" },
          { rotate: "-6deg", translate: "0 -4%" },
          { rotate: "0deg", translate: "0 0" },
        ],
        { duration: 1100, easing: "ease-in-out" },
      );
    }
    answer(TROLL.skeleton);
  };

  const prop = "absolute cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-lime rounded-lg";

  return (
    <Section
      id="dark"
      field="ink"
      forms={[{ shape: "shelf", tone: "bone", at: "inset-x-0 top-0 w-full h-[9vh] md:h-[13vh]" }]}
      className="pt-[clamp(5rem,14vh,11rem)] md:pt-[clamp(5rem,20vh,11rem)]"
    >
      <div className="px-[var(--edge)]">
        <div className="flex items-start justify-between gap-6">
          <SectionLabel index="02" className="text-bone">
            {t.label}
          </SectionLabel>
          <p className="label label-loose max-w-[12ch] whitespace-pre-line text-right leading-[1.9] text-bone/45">{t.kicker}</p>
        </div>

        <Words
          as="h2"
          className="brush lean mt-[clamp(1.75rem,4.5vh,3rem)] rotate-[1.2deg] select-none text-[clamp(3.8rem,11vw,9.5rem)] leading-[0.86] text-bone"
        >
          {t.heading}
        </Words>
        <p data-anim="rise" className="body-copy mt-[clamp(1.25rem,3vh,2rem)] max-w-[34ch] text-[clamp(1rem,1.4vw,1.2rem)] text-bone/65">
          {t.body}
        </p>
      </div>

      <GhostIndex className="right-[6%] top-[4%] hidden text-[clamp(9rem,21vw,19rem)] text-bone lg:block">02</GhostIndex>

      {/* the room */}
      <div
        ref={room}
        className="soon-room mt-[clamp(2rem,6vh,4rem)] h-[clamp(62rem,205svh,118rem)] md:h-[clamp(60rem,178vh,108rem)]"
      >
        {/* the flashlight you can hold: stuck to the bottom of the screen while you're in here */}
        <div className="soon-handle-rail pointer-events-none sticky top-[calc(100svh-7.5rem)] z-40 h-0 w-full items-start justify-center">
          <button
            ref={handle}
            type="button"
            aria-label="The torch: drag to point it, tap to switch it off"
            className="soon-handle pointer-events-auto relative -rotate-[62deg] cursor-grab active:cursor-grabbing"
          >
            <Sprite name="flashlight" scale={0.32} priority={false} />
          </button>
          <span className="hand pointer-events-none mt-3 -rotate-[4deg] text-[1.05rem] text-bone/55">{t.handle}</span>
        </div>

        {/* a dead bulb on its cord — lit once, near the end */}
        <div className="soon-swing soon-loop absolute left-1/2 top-0 z-[1] -ml-[calc(81px*0.9*var(--sprite-scale)/2)]">
          <Sprite name="bulb-off" scale={0.9} />
          <Sprite name="bulb-on" scale={0.9} className="soon-lit-only absolute inset-0" />
        </div>

        {/* the window, and the moon through it: moonlight doesn't need a torch */}
        <div className="absolute left-[3%] top-[3%] z-[25] w-[calc(430px*0.62*var(--sprite-scale))] md:left-[6%] md:top-[4%]">
          <div className="absolute inset-[14%_17%_24%_13%] overflow-hidden rounded-sm">
            <Sprite name="moon" scale={0.26} className="absolute right-[6%] top-[4%] opacity-90" />
            <span className="soon-bat soon-loop left-0 top-[28%] block w-[34%]" aria-hidden="true">
              <span><Sprite name="bat-up" scale={0.3} className="w-full" /></span>
              <span><Sprite name="bat-level" scale={0.3} className="w-full" /></span>
              <span><Sprite name="bat-down" scale={0.3} className="w-full" /></span>
            </span>
            <span className="soon-bat soon-loop left-0 top-[55%] block w-[24%]" aria-hidden="true">
              <span><Sprite name="bat-up" scale={0.22} className="w-full" /></span>
              <span><Sprite name="bat-level" scale={0.22} className="w-full" /></span>
              <span><Sprite name="bat-down" scale={0.22} className="w-full" /></span>
            </span>
          </div>
          <button type="button" tabIndex={-1} aria-label="The window" onClick={() => strikeRef.current()} className="relative block cursor-pointer">
            <Sprite name="window" scale={0.62} className="relative opacity-80" />
          </button>
        </div>

        {/* The camera in the corner, above the dark: you always see it, and it
            turns to follow wherever you point the light. The head sits on the
            post at the end of the bracket and turns about it. */}
        <button type="button" onClick={camera} aria-label="The camera" className={`${prop} right-[3%] top-[2%] z-[26] opacity-90 md:right-[6%]`}>
          <span className="relative block pl-[calc(130px*0.72*var(--sprite-scale)*0.62)] pt-[calc(113px*0.72*var(--sprite-scale)*0.55)]">
            <Sprite name="cctv-mount" scale={0.72} />
            <span ref={cam} className="absolute left-0 top-0 block origin-[82%_88%]">
              <Sprite name="cctv" scale={0.72} />
              {/* laid exactly over the art's own light (67% across, 11% down), so it blinks rather than doubles */}
              <span className="soon-rec soon-loop absolute left-[67%] top-[11%] block h-[8%] w-[7%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime shadow-[0_0_12px_var(--color-lime)]" />
            </span>
          </span>
        </button>

        <Sprite name="clock-empty" scale={0.55} className="absolute left-[60%] top-[13%] md:left-[64%]" />
        <Whisper className="left-[57%] top-[21.5%] md:left-[70%] md:top-[23%]">{t.whispers[7]}</Whisper>

        <Whisper className="left-[8%] top-[17%] md:left-[38%] md:top-[15%]">{t.whispers[0]}</Whisper>
        <Sprite name="scribble" scale={0.42} className="absolute left-[10%] top-[23%] -rotate-6 opacity-80 md:left-[30%] md:top-[24%]" />

        {/* a note that only says one thing */}
        <p className="display absolute left-[66%] top-[27%] rotate-[7deg] bg-[#ded5c2] px-3.5 py-2.5 text-[clamp(1.1rem,1.9vw,1.6rem)] leading-none tracking-tight text-ink shadow-[0_8px_20px_rgba(8,8,8,0.4)] md:left-[80%] md:top-[29%]">
          {t.dont}
        </p>

        {/* the door — knock and it answers */}
        <div className="absolute left-[24%] top-[31%] md:left-[40%] md:top-[31%]">
          <button type="button" onClick={knock} aria-label="Knock on the door" className={`${prop} relative block`}>
            <Sprite name={door === "smashed" ? "door-smashed" : "door-haunted"} scale={door === "smashed" ? 0.5 : 0.6} />
          </button>
          <p className="hand pointer-events-none absolute -right-[18%] top-[12%] rotate-[6deg] whitespace-pre-line bg-[#ded5c2] px-2.5 py-1.5 text-[0.95rem] leading-[1.1] text-ink/80 shadow-[0_6px_16px_rgba(8,8,8,0.35)]">
            {t.door}
          </p>
          {door === "asking" ? (
            <div className="absolute left-1/2 top-full z-[35] mt-2 flex -translate-x-1/2 gap-3">
              {(["trick", "treat"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={k === "trick" ? trick : treat}
                  className="label rounded-full border border-lime/60 bg-ink px-4 py-2 text-lime outline-none transition-colors duration-300 hover:bg-lime hover:text-ink focus-visible:bg-lime focus-visible:text-ink"
                >
                  {k}
                </button>
              ))}
            </div>
          ) : null}
          {sweet ? (
            <span key={sweet} className="arrive-in absolute -bottom-[6%] left-[-28%] block rotate-[-12deg]">
              <Sprite name={sweet} scale={0.6} />
            </span>
          ) : null}
        </div>

        {/* the only orange on the site, and it doesn't stay */}
        <button
          type="button"
          onClick={() => {
            pumpkin.current = true;
          }}
          aria-label="A pumpkin"
          className={`soon-pumpkin ${prop} left-[5%] top-[40%] md:left-[11%] md:top-[41%]`}
        >
          <Sprite name="cat-pumpkin" scale={0.85} />
        </button>

        <Whisper className="left-[58%] top-[41%] md:left-[22%] md:top-[48%]">{t.whispers[1]}</Whisper>

        {/* the telly: static behind the glass, and sometimes not only static */}
        <div className="absolute left-[60%] top-[47%] md:left-[67%] md:top-[48%]">
          <div ref={tv} className="absolute left-[9%] top-[27%] h-[48%] w-[64%] overflow-hidden rounded-[10%] bg-ink">
            <span className="soon-static soon-loop" />
            <span className="soon-tv-cat absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-200">
              <Sprite name="cat-oneeye" scale={0.5} />
            </span>
          </div>
          <Sprite name="tv" scale={0.8} className="relative" />
        </div>
        <Whisper className="left-[62%] top-[58%] md:left-[80%] md:top-[60%]">{t.whispers[3]}</Whisper>

        {/* ??? — and after the torch goes out, it's somewhere else */}
        <Sprite name="bubble-q" scale={0.7} className="soon-before absolute left-[40%] top-[50%] md:left-[53%] md:top-[50%]" />
        <Sprite name="bubble-q" scale={0.7} className="soon-after absolute left-[8%] top-[27%] md:left-[18%] md:top-[31%]" />
        <Whisper className="soon-after left-[36%] top-[52%] md:left-[50%] md:top-[53%]">{t.moved}</Whisper>

        {/* a sheet with eyes — lift it */}
        <button
          type="button"
          onClick={() => {
            if (!ghostUp) answer(TROLL.ghost);
            setGhostUp(!ghostUp);
          }}
          aria-label="A ghost"
          className={`${prop} left-[12%] top-[56%] md:left-[31%] md:top-[58%]`}
        >
          <span className="relative block">
            <Sprite name="cat-playful" scale={0.34} className="absolute bottom-0 left-1/2 -translate-x-1/2" />
            <span
              className="relative block transition-[translate,rotate,opacity] duration-700 ease-[var(--ease-out-soft)]"
              style={ghostUp ? { translate: "10% -70%", rotate: "14deg", opacity: 0.15 } : undefined}
            >
              <Sprite name="ghost" scale={1} />
            </span>
          </span>
        </button>

        {/* the cat that was facing away */}
        <Sprite name="cat-away" scale={0.55} className="soon-before absolute left-[56%] top-[63%] md:left-[58%] md:top-[64%]" />
        <Sprite name="cat-sneak" scale={0.5} className="soon-after absolute left-[54%] top-[65%] md:left-[56%] md:top-[66%]" />

        <Whisper className="left-[8%] top-[66%] md:left-[8%] md:top-[67%]">{t.whispers[4]}</Whisper>

        <div className="absolute left-[50%] top-[73%] md:left-[73%] md:top-[73%]">
          <p className="hand mb-1 whitespace-pre-line text-[clamp(0.95rem,1.3vw,1.2rem)] leading-[1.1] text-bone/65">{t.scared}</p>
          <Sprite name="cat-scared" scale={0.42} />
        </div>
        <Whisper className="left-[62%] top-[86%] md:left-[86%] md:top-[70%]">{t.whispers[6]}</Whisper>

        {/* the skeleton cat — ask it to dance */}
        <button type="button" onClick={dance} aria-label="A cat in a skeleton suit" className={`${prop} left-[6%] top-[75%] md:left-[40%] md:top-[76%]`}>
          <Sprite name="cat-skeleton" scale={0.72} />
        </button>

        <Sprite name="cat-witch" scale={0.72} className="absolute left-[80%] top-[55%] md:left-[86%] md:top-[56%]" />

        {/* the floor */}
        <Sprite name="dice" scale={0.3} className="absolute left-[40%] top-[84%] rotate-12 md:left-[13%] md:top-[86%]" />
        <Sprite name="controller" scale={0.36} className="absolute left-[20%] top-[88%] -rotate-6 md:left-[20%] md:top-[89%]" />
        <Whisper className="left-[16%] top-[94%] md:left-[18%] md:top-[95%]">{t.whispers[2]}</Whisper>
        <Sprite name="cable" scale={0.34} className="absolute left-[72%] top-[91%] rotate-[20deg] md:left-[60%] md:top-[88%]" />

        {/* at the end of it: the one that was watching all along */}
        <Sprite name="eyes-glow" scale={0.75} className="absolute left-1/2 top-[82%] -translate-x-1/2" />
        <Whisper className="left-[30%] top-[79%] md:left-[40%] md:top-[80%]">{t.whispers[5]}</Whisper>

        <span className="soon-fog soon-loop pointer-events-none top-[66%]" />
        <span className="soon-fog soon-loop pointer-events-none top-[78%]" />

        {/* what lightning shows: the window's light on the wall, the tree outside across it */}
        <span aria-hidden="true" className="soon-strike-light" />
        <svg aria-hidden="true" viewBox={TREE.view} className="soon-strike-shadow">
          <path d={TREE.d} />
        </svg>

        {/* things that are only there in the beam */}
        <Critters bats={3} wisps={0} ghosts={2} sky={[0.08, 0.6]} ground={[0.6, 0.9]} className="z-[12]" />

        {/* the dark, with a torch-shaped hole in it */}
        <div ref={shade} className="soon-shade" aria-hidden="true">
          <div className="soon-shake soon-loop">
            <div ref={beam} className="soon-beam">
              <span className="soon-dust soon-loop left-[44%] top-[40%]" />
              <span className="soon-dust soon-loop left-[58%] top-[55%] [animation-delay:-2.4s]" />
              <span className="soon-dust soon-loop left-[36%] top-[60%] [animation-delay:-4.1s]" />
              <span className="soon-dust soon-loop left-[52%] top-[33%] [animation-delay:-5.6s]" />
            </div>
          </div>
          <div className="soon-blackout" />
        </div>

        {/* the eyes, above the dark */}
        <span ref={eyes} className="soon-eyes" aria-hidden="true">
          <span className="soon-eyes-near block">
            <GlowEyes variant="sly" className="soon-loop w-full" glowId="soon-room-eyes" />
          </span>
        </span>
      </div>
    </Section>
  );
}
