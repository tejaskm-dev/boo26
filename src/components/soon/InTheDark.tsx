"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section, { SectionLabel } from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import GhostIndex from "@/components/ui/GhostIndex";
import Words from "@/components/fx/Words";
import Awake from "./Awake";
import Cut from "./Cut";
import { cue } from "./sound";
import { hold } from "./hold";
import { onBacktrack } from "./backtrack";
import { jumpscare } from "./JumpScare";
import InkEyes from "./InkEyes";
import Sleeper, { EYES, FACE, OPEN_EYES, ZZZ } from "./Sleeper";
import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/motion";
import { isNavActive } from "@/lib/navState";
import { subscribePointer } from "@/lib/pointer";
import { CUTS, SECRETS, SOON, TROLL } from "@/lib/soon";
import { answer, buzz, shiver, troll } from "./troll";

/** with the sound on, the card into the room is whispered too — and the one on the way back out */
const VOICES = ["lights-off", "eyes-open", "breathing"] as const;
const BACK_VOICES = ["so-soon", "followed"] as const;

/** the rest of the room's eyes, on the wallpaper, as % of the sleeper's square — they open when it does */
const WATCHERS: { at: string; tilt: number; delay: number }[] = [
  { at: "left-[6%] top-[30%] w-[4%]", tilt: -8, delay: 0.1 },
  { at: "left-[12%] top-[48%] w-[3%]", tilt: 6, delay: 0.5 },
  { at: "left-[86%] top-[34%] w-[4.5%]", tilt: 9, delay: 0.3 },
  { at: "left-[90%] top-[52%] w-[3%]", tilt: -5, delay: 0.8 },
  { at: "left-[30%] top-[22%] w-[3%]", tilt: -10, delay: 0.65 },
  { at: "left-[63%] top-[21%] w-[3.4%]", tilt: 7, delay: 0.2 },
  { at: "left-[45%] top-[9%] w-[2.6%]", tilt: 3, delay: 0.9 },
  { at: "left-[35%] top-[4%] w-[2%]", tilt: -6, delay: 1.1 },
  { at: "left-[67%] top-[8%] w-[2.4%]", tilt: 5, delay: 0.4 },
  { at: "left-[80%] top-[66%] w-[3%]", tilt: -3, delay: 1.3 },
];

/** how many times it stirs before it wakes */
const STIRS = 4;

/**
 * 02 — the room, with the lights off. Something's asleep in it.
 *
 * The whole room is one enormous black cat, asleep (Sleeper), and the torch
 * only ever shows you a piece of it: an ear, a closed eye, a whisker. Hold
 * the light on its face and it stirs — an ear goes, the snoring stops, an
 * eye cracks open for a second. Keep at it (or just keep scrolling) and it
 * wakes: the torch dies, and in the dark there's nothing but its eyes, and
 * then all the other eyes in the room. Now and then lightning shows you the
 * whole of it, for a moment.
 *
 * The torch follows the cursor on a laptop; on a phone, tilting it, dragging
 * the torch at the bottom, tapping where to look, or — with none of those —
 * it sweeps the room as you scroll. The room holds still on screen (sticky)
 * for a screen's worth of scrolling, so there's time to look.
 *
 * The dark is one layer fixed to the screen and clipped to the room, moved on
 * the compositor (.soon-beam); everything above it moves whole. With motion
 * turned down, or no script, the lights are on and it's simply asleep.
 */
export default function InTheDark() {
  const t = SOON.dark;
  const runway = useRef<HTMLDivElement>(null);
  const room = useRef<HTMLDivElement>(null);
  const beam = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const over = useRef<HTMLDivElement>(null);
  const gaze = useRef<HTMLSpanElement>(null);
  const cam = useRef<HTMLSpanElement>(null);
  const handle = useRef<HTMLButtonElement>(null);
  const strikeRef = useRef<() => void>(() => {});
  const out = useRef<HTMLDivElement>(null);
  const [woke, setWoke] = useState(false);
  // "Don't wake it." — and if you scroll back up after you did, it says so
  const [changed, setChanged] = useState(false);
  const headline = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = headline.current;
    if (!el || !woke || changed) return;
    // swapped while it's off screen, so you never see it happen
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) setChanged(true);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [woke, changed]);

  // The heading glitches only while it's on screen, or nearly: the room below
  // it is a long scroll, and the section stays awake the whole way down.
  useEffect(() => {
    const el = headline.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        el.dataset.awake = e.isIntersecting ? "true" : "false";
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = room.current;
    const run = runway.current;
    const beamEl = beam.current;
    const overEl = over.current;
    const gazeEl = gaze.current;
    const camEl = cam.current;
    if (!el || !run || !beamEl || !overEl || !gazeEl || prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    el.dataset.torch = "on";
    el.dataset.cat = "asleep";

    const root = document.documentElement;
    const scrollY = () => getLenis()?.scroll ?? window.scrollY;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    // --- geometry, measured when the layout changes — never while scrolling ---
    let runTop = 0;
    let runH = 1;
    let stageW = 1;
    let stageH = 1;
    let faceX = 0;
    let faceY = 0;
    let faceR = 100;
    let camX = 0;
    let camY = 0;
    const measure = () => {
      const r = run.getBoundingClientRect();
      const s = el.getBoundingClientRect();
      runTop = r.top + scrollY();
      runH = r.height;
      stageW = s.width;
      stageH = s.height;
      // the sleeper's square covers the room, centred
      const size = Math.max(stageW, stageH);
      const left = (stageW - size) / 2;
      const top = (stageH - size) / 2;
      faceX = left + (FACE.x / 100) * size;
      faceY = top + (FACE.y / 100) * size;
      faceR = (FACE.r / 100) * size;
      if (camEl) {
        const c = camEl.getBoundingClientRect();
        camX = c.left + c.width * 0.72;
        camY = c.top - s.top + c.height * 0.4;
      }
    };
    /** where the room's top is on screen: it slides in, holds, slides out */
    const stageTop = () => {
      const y = scrollY();
      const st = runTop - y;
      if (st > 0) return st;
      const end = runTop + runH - stageH;
      return y < end ? 0 : end - y;
    };

    // --- the torch ---------------------------------------------------------
    // On a laptop the light is where the cursor is, with only the weight of a
    // torch in the hand: a longer follow read as lag. Tilting a phone wants
    // the smoothing.
    const follow = fine ? 0.12 : 0.32;
    const bx = gsap.quickTo(beamEl, "x", { duration: follow, ease: "power3.out" });
    const by = gsap.quickTo(beamEl, "y", { duration: follow, ease: "power3.out" });
    const turn = camEl ? gsap.quickTo(camEl, "rotation", { duration: 0.9, ease: "power3.out" }) : null;
    const gx = gsap.quickTo(gazeEl, "x", { duration: 0.6, ease: "power3.out" });
    const gy = gsap.quickTo(gazeEl, "y", { duration: 0.6, ease: "power3.out" });
    let beamX = window.innerWidth / 2;
    let beamY = window.innerHeight * 0.3;
    bx(beamX);
    by(beamY);

    /** the light, there — and the cat, once it's up, watches it (unless it's
     * only the scroll sweeping it about: then moving the eyes each frame was
     * the glowing layer they're in drawn again and again, for no one) */
    const aim = (x: number, y: number, watched = true) => {
      beamX = x;
      beamY = y;
      bx(x);
      by(y);
      if (turn) {
        const a = (Math.atan2(beamY - (camY + stageTop()), beamX - camX) * 180) / Math.PI;
        turn(Math.max(-48, Math.min(22, ((a - 180 + 540) % 360) - 180)));
      }
      if (awake && watched) {
        // once it's up, it watches the light
        const top = stageTop();
        gx(Math.max(-1, Math.min(1, (x - faceX) / stageW)) * faceR * 0.12);
        gy(Math.max(-1, Math.min(1, (y - top - faceY) / stageH)) * faceR * 0.08);
      }
    };

    // --- what it does ----------------------------------------------------------
    let awake = false;
    let stirs = 0;
    let glare = 0;
    const stir = () => {
      if (awake) return;
      stirs += 1;
      el.dataset.twitch = Math.random() < 0.5 ? "l" : "r";
      el.dataset.hush = "true";
      later(() => delete el.dataset.twitch, 520);
      later(() => delete el.dataset.hush, 2600);
      if (stirs >= 2) {
        // one eye, just barely, and it's shut again
        el.dataset.peek = "true";
        later(() => delete el.dataset.peek, 360);
      }
      buzz(16);
      if (stirs >= STIRS) later(wake, 500);
    };
    const wake = () => {
      if (awake) return;
      awake = true;
      // stay and watch it happen
      hold("room-wake", 2400, { tail: 700 });
      setWoke(true);
      el.dataset.cat = "awake";
      overEl.dataset.look = "true";
      shiver(el, 9);
      buzz(60);
      troll("awake", TROLL.awake);
      // it doesn't like being woken
      cue("hiss", true);
      later(() => cue("meow", true), 360);
      later(() => cue("growl", true), 1700);
      el.dataset.lunge = "true";
      later(() => delete el.dataset.lunge, 900);
      // the torch goes, and there's just the eyes
      const was = el.dataset.torch;
      el.dataset.torch = "off";
      later(() => {
        if (el.dataset.torch === "off") el.dataset.torch = was === "off" ? "off" : "on";
      }, 1500);
    };

    // --- what moves the torch ----------------------------------------------
    let active = false;
    let manualUntil = 0;
    let tilted = false;

    const unsub = subscribePointer((nx, ny) => {
      if (!active) return;
      if (!fine) {
        tilted = true;
        if (Date.now() < manualUntil) return;
      }
      aim(((nx + 1) / 2) * window.innerWidth, ((ny + 1) / 2) * window.innerHeight);
    });

    // tap where to look — and tapping its face is the quickest way to wake it
    let downX = 0;
    let downY = 0;
    const onDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (!active || Math.hypot(e.clientX - downX, e.clientY - downY) > 10) return;
      if ((e.target as Element).closest("button")) return;
      if (Math.hypot(e.clientX - faceX, e.clientY - stageTop() - faceY) < faceR) {
        if (!awake) stir();
        else {
          // a slow blink: in cat, that's fondness. probably.
          el.dataset.blink = "true";
          later(() => delete el.dataset.blink, 1400);
        }
      }
      if (e.pointerType === "mouse") return;
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

    // --- the frame: is the light in its face? --------------------------------
    const tick = (_t: number, dms: number) => {
      if (!active || awake || document.hidden || root.dataset.idle === "true" || isNavActive()) return;
      if (el.dataset.torch !== "on") return;
      const dt = Math.min(0.05, (dms || 16.7) / 1000);
      const x = Number(gsap.getProperty(beamEl, "x"));
      const y = Number(gsap.getProperty(beamEl, "y")) - stageTop();
      if (Math.hypot(x - faceX, y - faceY) < faceR) {
        glare += dt;
        if (glare > 0.8) {
          glare = 0;
          stir();
        }
      } else {
        glare = Math.max(0, glare - dt * 0.5);
      }
    };

    // the sweep, eased toward where the scroll says, a frame at a time
    let sweepTo: [number, number] | null = null;
    let sweepX = beamX;
    let sweepY = beamY;
    const sweep = (_t: number, dms: number) => {
      if (!sweepTo || !active || document.hidden) return;
      const k = 1 - Math.exp(-Math.min(0.05, (dms || 16.7) / 1000) / 0.3);
      sweepX += (sweepTo[0] - sweepX) * k;
      sweepY += (sweepTo[1] - sweepY) * k;
      if (Math.abs(sweepTo[0] - sweepX) < 0.5 && Math.abs(sweepTo[1] - sweepY) < 0.5) sweepTo = null;
      aim(sweepX, sweepY, false);
    };

    // --- as you go through the room ------------------------------------------
    let firstStrike = false;
    /** come back up toward it from well past it */
    let returned = false;
    let lastScale = 1;
    let dived = false;
    let through = false;
    const covers = [...el.querySelectorAll<HTMLElement>(".soon-cover")];
    const onScroll = () => {
      if (!active) return;
      const p = (scrollY() - runTop) / Math.max(1, runH - stageH);

      // nothing moving the torch: it sweeps the room with the scroll, and
      // crosses its face on the way — followed slowly (sweep), so a quick
      // scroll back through the room drifts the light rather than flinging
      // it across the screen and back
      if (!fine && !tilted && Date.now() >= manualUntil) {
        sweepTo = [
          window.innerWidth * (0.5 + 0.34 * Math.sin(p * Math.PI * 3.1)),
          window.innerHeight * (0.5 + 0.22 * Math.cos(p * Math.PI * 2.4)),
        ];
      } else sweepTo = null;
      // the torch handle only while the room has the whole screen: as it
      // slides in or out, a swipe that starts on the handle has to scroll
      const docked = Math.abs(stageTop()) < window.innerHeight * 0.04 ? "true" : "false";
      if (el.dataset.docked !== docked) el.dataset.docked = docked;
      // (its first look comes a moment in: after that, only standing in it)
      if (p > 0.03) hold("room-in", 2700, { tail: 1300 });
      // back up into it once it's awake: it's watching the way you came, and
      // it holds you there a moment, growling. A fling up straight through
      // it is brought back to the middle of the room for it.
      if (awake && returned && p < 0.62) {
        hold("room:up", 2400, {
          way: "up",
          tail: 1200,
          ...(p < 0.05 ? { to: runTop + (runH - stageH) * 0.5, glide: 0.6 } : {}),
          onHeld: () => cue("growl"),
        });
      }
      if (!firstStrike && p > 0.04) {
        // the first thing that happens in here: you see what you're standing
        // in front of (once you're standing still in front of it)
        firstStrike = true;
        let tries = 0;
        const first = () => (still() || ++tries > 12 ? active && strikeRef.current() : later(first, 400));
        later(first, 1400);
      }
      if (!awake && p > 0.62) wake();

      // The camera: a slow push in for as long as you're in here — and once
      // it's awake, the last stretch dives into its eye and out the other side.
      const push = 1 + Math.min(1, Math.max(0, p)) * 0.08;
      const dive = awake ? Math.max(0, Math.min(1, (p - 0.8) / 0.2)) : 0;
      const scale = push * (1 + dive * dive * dive * 28);
      if (Math.abs(scale - lastScale) > 0.001) {
        lastScale = scale;
        gsap.set(covers, { scale });
        el.dataset.dive = dive > 0.4 ? "true" : "false";
        // and out the other side, into the light
        const light = Math.max(0, Math.min(1, (dive - 0.72) / 0.24));
        if (out.current) out.current.style.opacity = String(light);
        // (and the header, over it, wears what's under it: FieldTone)
        const run = runway.current;
        const tone = light > 0.5 ? "bone" : "ink";
        if (run && run.dataset.field !== tone) {
          run.dataset.field = tone;
          window.dispatchEvent(new Event("field:change"));
        }
      }
      if (dive > 0.05 && !dived) {
        dived = true;
        cue("inhale");
      } else if (dive === 0) dived = false;
      if (dive > 0.97 && !through) {
        through = true;
        cue("thud");
      } else if (dive < 0.5) through = false;
    };
    const lenis = getLenis();
    if (lenis) lenis.on("scroll", onScroll);
    else window.addEventListener("scroll", onScroll, { passive: true });

    // --- the torch has a mind of its own ---------------------------------------
    // ...but only acts up while you're standing in here: the room has the
    // screen, the page is still, and it isn't diving. Its timers came due
    // just as often while you were scrolling back out through it, and a
    // flicker or a flash under a moving page read as the light jittering.
    const still = () => {
      const lenis = getLenis();
      return !lenis?.isScrolling && Math.abs(stageTop()) < window.innerHeight * 0.04 && lastScale < 1.1;
    };
    let flicker = 0;
    let glimpses = 0;
    const scheduleFlicker = (ms = 11000 + Math.random() * 7000) => {
      window.clearTimeout(flicker);
      flicker = window.setTimeout(() => {
        // (due while you're moving: in a moment, then)
        if (active && !document.hidden && !still()) return scheduleFlicker(2500);
        if (active && !document.hidden && el.dataset.torch === "on") {
          el.dataset.flicker = "true";
          later(() => delete el.dataset.flicker, 700);
          // in the long dark of the flicker: eyes, right where you were looking
          if (glimpses < 2 && ghost.current) {
            glimpses += 1;
            const top = stageTop();
            ghost.current.style.translate = `${Math.round(beamX)}px ${Math.round(beamY - top)}px`;
            later(() => {
              if (ghost.current) ghost.current.dataset.on = "true";
            }, 220);
            later(() => {
              if (ghost.current) delete ghost.current.dataset.on;
            }, 420);
          }
        }
        scheduleFlicker();
      }, ms);
    };

    // Lightning, through the window: for a moment the dark lifts and you see
    // the whole of it. Two flashes in 0.8s, inside the three-a-second limit.
    let thunder = 0;
    let lastStrike = 0;
    const strike = () => {
      const now = performance.now();
      if (now - lastStrike < 3500) return;
      lastStrike = now;
      cue("thunder");
      shade.current?.animate(
        [{ opacity: 1 }, { opacity: 0.1, offset: 0.08 }, { opacity: 0.85, offset: 0.24 }, { opacity: 0.25, offset: 0.36 }, { opacity: 1 }],
        { duration: 860, easing: "ease-out" },
      );
    };
    strikeRef.current = strike;
    const scheduleStrike = (ms = 13000 + Math.random() * 7000) => {
      window.clearTimeout(thunder);
      thunder = window.setTimeout(() => {
        if (active && !document.hidden && !still()) return scheduleStrike(2500);
        if (active && !document.hidden) strike();
        scheduleStrike();
      }, ms);
    };

    let first = true;
    let visited = false;
    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
      el.dataset.active = active ? "true" : "false";
      if (active && !visited) {
        visited = true;
        window.dispatchEvent(new Event("soon:been-in-the-dark"));
      }
      if (!active) {
        window.clearTimeout(flicker);
        window.clearTimeout(thunder);
        return;
      }
      measure();
      scheduleFlicker();
      scheduleStrike();
      if (first) {
        first = false;
        const light = window.matchMedia("(prefers-color-scheme: light)").matches;
        troll("lights", light ? TROLL.lightMode : TROLL.darkMode);
      }
    });
    io.observe(run);

    // go back up toward it after you woke it, and it's right there
    const stopBack = onBacktrack(run, () => {
      returned = true;
      if (awake) jumpscare("eyes");
    });
    // and if you just keep going after waking it
    const leaving = ScrollTrigger.create({
      trigger: run,
      start: "top top",
      end: "bottom top",
      onLeave: () => {
        if (awake) troll("anyway", TROLL.anyway);
      },
    });

    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(run);
    window.addEventListener("resize", measure);
    ScrollTrigger.addEventListener("refresh", measure);
    gsap.ticker.add(tick);
    if (!fine) gsap.ticker.add(sweep);

    return () => {
      stopBack();
      leaving.kill();
      gsap.ticker.remove(tick);
      gsap.ticker.remove(sweep);
      unsub();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", measure);
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
      window.clearTimeout(thunder);
      timers.forEach((id) => window.clearTimeout(id));
      for (const k of ["torch", "cat", "twitch", "hush", "peek", "blink", "flicker", "flash", "active"]) delete el.dataset[k];
    };
  }, []);

  const prop = "absolute cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-lime rounded-lg";

  return (
    <Section
      id="dark"
      field="ink"
      forms={[{ shape: "shelf", tone: "bone", at: "inset-x-0 top-0 w-full h-[9vh] md:h-[13vh]" }]}
      className="pt-[clamp(5rem,14vh,11rem)] md:pt-[clamp(5rem,20vh,11rem)]"
    >
      <Cut lines={CUTS.dark} back={CUTS.darkBack} voices={VOICES} backVoices={BACK_VOICES} />
      <Awake />

      <div className="px-[var(--edge)]">
        <SectionLabel index="02" className="text-bone">
          {t.label}
        </SectionLabel>
        <div ref={headline}>
          <Words
            key={changed ? "woke" : "asleep"}
            as="h2"
            className="soon-glitch brush lean mt-[clamp(1.75rem,4.5vh,3rem)] rotate-[1.2deg] select-none text-[clamp(3.8rem,11vw,9.5rem)] leading-[0.86] text-bone"
          >
            {changed ? t.woke : t.heading}
          </Words>
        </div>
      </div>

      <GhostIndex className="right-[6%] top-[4%] hidden text-[clamp(9rem,21vw,19rem)] text-bone lg:block">02</GhostIndex>

      {/* the room holds still for a screen's worth of scrolling */}
      <div ref={runway} data-wait="room" data-field="ink" className="soon-runway relative mt-[clamp(2rem,6vh,4rem)]">
        <div ref={room} className="soon-room sticky top-0 h-[100svh] min-h-[34rem] w-full overflow-hidden">
          {/* --- the room, as it is with the lights on ----------------------- */}
          <div className="soon-cover soon-loop">
            <Sleeper />
          </div>

          {/* --- the dark, with a torch-shaped hole in it -------------------- */}
          <div ref={shade} className="soon-shade" aria-hidden="true">
            <div className="soon-shake soon-loop">
              <div ref={beam} className="soon-beam">
                {/* the dust in the light, in the beam's own square */}
                <span className="soon-beam-light">
                  <span className="soon-dust soon-loop left-[44%] top-[40%]" />
                  <span className="soon-dust soon-loop left-[58%] top-[55%] [animation-delay:-2.4s]" />
                  <span className="soon-dust soon-loop left-[36%] top-[60%] [animation-delay:-4.1s]" />
                  <span className="soon-dust soon-loop left-[52%] top-[33%] [animation-delay:-5.6s]" />
                </span>
              </div>
            </div>
            <div className="soon-blackout" />
          </div>

          {/* --- above the dark: what you can see without a torch ------------ */}
          <div ref={over} data-look="false" className="soon-cover soon-cover-over soon-loop" aria-hidden="true">
            {/* its eyes — shut, then barely, then not at all */}
            <span
              className="soon-big-eyes absolute"
              style={{ left: `${OPEN_EYES.left}%`, top: `${OPEN_EYES.top}%`, width: `${OPEN_EYES.width}%` }}
            >
              <span ref={gaze} className="block">
                <svg viewBox="-24 -24 182 116" className="block w-[135.8%] -translate-x-[13.2%] -translate-y-[20.7%] overflow-visible">
                  <g filter="url(#soon-big-eyes-glow)" fill="var(--color-lime)" opacity={0.9}>
                    {EYES.map((d) => (
                      <path key={d} d={d} />
                    ))}
                  </g>
                  <g fill="var(--color-lime)">
                    {EYES.map((d) => (
                      <path key={d} d={d} />
                    ))}
                  </g>
                  <defs>
                    <filter id="soon-big-eyes-glow" x="-40%" y="-80%" width="180%" height="260%">
                      <feGaussianBlur stdDeviation="7" />
                    </filter>
                  </defs>
                </svg>
              </span>
            </span>

            {/* its snoring */}
            <span className="soon-zzz absolute" style={{ left: `${ZZZ.x}%`, top: `${ZZZ.y}%` }}>
              {[0, 1, 2].map((i) => (
                <span key={i} className="soon-z soon-loop hand" style={{ animationDelay: `${-i * 1.2}s` }}>
                  z
                </span>
              ))}
            </span>

            {/* and everything else in here */}
            {WATCHERS.map((w, i) => (
              <InkEyes key={i} className={w.at} tilt={w.tilt} delay={w.delay} blink={5 + (i % 4)} />
            ))}
          </div>

          <p className="soon-sleep-note hand pointer-events-none absolute bottom-[16%] left-[6%] z-[30] -rotate-[4deg] text-[clamp(1.05rem,1.6vw,1.4rem)] text-bone/60 md:bottom-[9%]">
            {woke ? t.oops : t.sleeping}
          </p>

          {/* the window, and the moon through it: moonlight doesn't need a torch — tap it for lightning */}
          <div className="soon-glass absolute left-[4%] top-[13%] z-[30] w-[calc(430px*0.34*var(--sprite-scale))] md:left-[3%] md:top-[20%]">
            <div className="absolute inset-[14%_17%_24%_13%] overflow-hidden rounded-sm">
              <Sprite name="moon" scale={0.15} className="absolute right-[6%] top-[4%] opacity-90" />
              <span className="soon-bat soon-loop left-0 top-[28%] block w-[34%]" aria-hidden="true">
                <span className="soon-loop"><Sprite name="bat-up" scale={0.18} className="w-full" /></span>
                <span className="soon-loop"><Sprite name="bat-level" scale={0.18} className="w-full" /></span>
                <span className="soon-loop"><Sprite name="bat-down" scale={0.18} className="w-full" /></span>
              </span>
            </div>
            <button type="button" tabIndex={-1} aria-label="The window" data-secret={SECRETS.window} onClick={() => strikeRef.current()} className="relative block cursor-pointer">
              <Sprite name="window" scale={0.34} className="relative opacity-90" />
            </button>
          </div>

          {/* The camera in the corner, above the dark: it turns to follow the light. */}
          <span data-secret={SECRETS.camera} className={`${prop} right-[4%] top-[12%] z-[30] opacity-90 md:right-[3%] md:top-[15%]`}>
            <span className="relative block pl-[calc(130px*0.6*var(--sprite-scale)*0.62)] pt-[calc(113px*0.6*var(--sprite-scale)*0.55)]">
              <Sprite name="cctv-mount" scale={0.6} />
              {/* (a layer of its own: turning it is a move, not a repaint) */}
              <span ref={cam} className="absolute left-0 top-0 block origin-[82%_88%] will-change-transform">
                <Sprite name="cctv" scale={0.6} />
                <span className="soon-rec soon-loop absolute left-[67%] top-[11%] block h-[8%] w-[7%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime shadow-[0_0_12px_var(--color-lime)]" />
              </span>
            </span>
          </span>

          {/* what's there for a blink when the torch cuts out */}
          <span ref={ghost} className="soon-glimpse" aria-hidden="true">
            <svg viewBox="0 0 134 68">
              {EYES.map((d) => (
                <path key={d} d={d} />
              ))}
            </svg>
          </span>

          {/* the other side of its eye: the light the next act happens in */}
          <div ref={out} className="soon-room-out" aria-hidden="true" />

          {/* the torch you can hold — phones and touch laptops */}
          <div className="soon-handle-rail pointer-events-none absolute inset-x-0 bottom-[3%] z-40 flex-col items-center">
            <button
              ref={handle}
              type="button"
              aria-label="The torch: drag to point it, tap to switch it off"
              className="soon-handle pointer-events-auto relative -rotate-[62deg] cursor-grab active:cursor-grabbing"
            >
              <Sprite name="flashlight" scale={0.32} priority={false} />
            </button>
            <span className="hand pointer-events-none mt-1 -rotate-[4deg] text-[1.05rem] text-bone/55">{t.handle}</span>
          </div>
        </div>
      </div>
    </Section>
  );
}
