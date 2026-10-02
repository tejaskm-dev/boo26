"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/motion";
import { isNavActive } from "@/lib/navState";
import { curtainUp } from "@/lib/curtain";
import { SPRITE } from "@/lib/sprites";
import { onTierDrop, rich } from "@/lib/tier";
import { TROLL } from "@/lib/soon";
import { buzz, troll } from "./troll";

type Bat = { x: number; y: number; vx: number; vy: number; t: number; p: number; w: number; life: number; dir: number };
type Eye = { el: HTMLElement; x: number; y: number; r: number; shut: boolean; shutUntil: number; lx: number; ly: number };
type Box = { x: number; y: number; w: number; h: number };

/** the bat's wingbeat, as the frames it cycles through: up, level, down, level */
const BEAT = [0, 1, 2, 1];

/**
 * The night's living things: the cat-bats out of the artwork flapping about
 * and scattering from you — tap the dark and more burst out of it — and the
 * eyes in the ink narrowing at you and shutting when you get too close.
 *
 * They keep to one area of the section — the element matching `zone`,
 * usually the ink field the night lives in — and fall back to the whole
 * section when there isn't one.
 *
 * "You" is the cursor on a laptop. On a phone it's your finger while it's on
 * the glass, and otherwise the middle of the screen.
 *
 * One canvas the size of the screen, fixed and clipped to the section (the
 * way the torch's dark is), drawn only while the section is on screen and
 * the page is being looked at; the artwork is scaled down once into small
 * bitmaps, and nothing reads layout per frame. Even so, a canvas redrawn
 * every frame is the first thing a weaker phone feels, so it's only here on
 * a device that can take it (src/lib/tier.ts) — and it goes, for good, if
 * the frames start running long. With motion turned down it doesn't run.
 */
export default function Critters({
  bats = 6,
  sky = [0.04, 0.42],
  span = [0, 1],
  zone = "[data-night]",
  className = "",
}: {
  bats?: number;
  /** the band the bats fly in, as fractions of the zone's height */
  sky?: [number, number];
  /** and across, as fractions of its width — a field's wavy edge leaves cream inside its box */
  span?: [number, number];
  /** the part of the section they keep to */
  zone?: string;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  // as numbers, so a parent re-rendering with a fresh array doesn't restart the night
  const [skyTop, skyBot] = sky;
  const [spanL, spanR] = span;

  useEffect(() => {
    const cv = canvas.current;
    const section = wrap.current?.closest("section");
    if (!cv || !section || prefersReducedMotion() || !rich()) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    gsap.registerPlugin(ScrollTrigger);

    const root = document.documentElement;
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const scrollY = () => getLenis()?.scroll ?? window.scrollY;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    let dead = false;

    // --- the artwork, scaled down once ------------------------------------------
    /** an image drawn once at the largest size it's ever shown, so frames only ever shrink it a little */
    const bitmap = (src: string, cssWidth: number, ratio: number) => {
      const out = document.createElement("canvas");
      out.width = Math.round(cssWidth * dpr);
      out.height = Math.round(cssWidth * ratio * dpr);
      const ready = { canvas: out, ok: false };
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      img
        .decode()
        .then(() => {
          if (dead) return;
          const c = out.getContext("2d");
          if (!c) return;
          c.imageSmoothingQuality = "high";
          c.drawImage(img, 0, 0, out.width, out.height);
          ready.ok = true;
        })
        .catch(() => {});
      return ready;
    };
    const batRatio = SPRITE["bat-level"].h / SPRITE["bat-level"].w;
    const wings = [SPRITE["bat-up"], SPRITE["bat-level"], SPRITE["bat-down"]].map((s) => bitmap(s.src, 96, batRatio));

    // --- geometry: measured on layout changes only -------------------------------
    let W = 0;
    let H = 0;
    let top = 0;
    let sw = 1;
    let sh = 1;
    let area: Box = { x: 0, y: 0, w: 1, h: 1 };
    let small = false;
    let eyes: Eye[] = [];
    const size = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const measure = () => {
      const r = section.getBoundingClientRect();
      const y0 = scrollY();
      top = r.top + y0;
      sw = r.width;
      sh = r.height;
      small = sw < 640;
      const z = [...section.querySelectorAll(zone)]
        .map((el) => el.getBoundingClientRect())
        .find((b) => b.width > 0 && b.height > 0);
      area = z ? { x: z.left - r.left, y: z.top - r.top, w: z.width, h: z.height } : { x: 0, y: 0, w: sw, h: sh };
      const at = (el: Element) => {
        const b = el.getBoundingClientRect();
        return { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2, r: b.width / 2 };
      };
      eyes = [...section.querySelectorAll<HTMLElement>("[data-eye]")]
        .filter((el) => el.offsetParent !== null)
        .map((el) => {
          const was = eyes.find((e) => e.el === el);
          return { el, ...at(el), shut: was?.shut ?? false, shutUntil: was?.shutUntil ?? 0, lx: was?.lx ?? 0, ly: was?.ly ?? 0 };
        });
    };

    // --- the population ------------------------------------------------------------
    const flock: Bat[] = [];
    const batWidth = () => (small ? rand(40, 58) : rand(54, 86));
    const seed = () => {
      flock.length = 0;
      for (let i = 0; i < bats; i++) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        flock.push({
          x: area.x + rand(spanL + (spanR - spanL) * 0.1, spanR - (spanR - spanL) * 0.1) * area.w,
          y: area.y + rand(skyTop, skyBot) * area.h,
          vx: rand(40, 80) * dir,
          vy: 0,
          t: rand(0, 9),
          p: rand(0, 4),
          w: batWidth(),
          life: -1,
          dir,
        });
      }
    };

    // --- you ------------------------------------------------------------------------------
    let px = -9999;
    let py = -9999;
    let touchUntil = 0;
    let mouseSeen = false;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouseSeen = true;
      px = e.clientX;
      py = e.clientY;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      px = t.clientX;
      py = t.clientY;
      touchUntil = performance.now() + 1400;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    /** where attention is, in section coordinates */
    const focus = () => {
      const y0 = scrollY();
      if (mouseSeen && !coarse) return { x: px, y: py + y0 - top, real: true };
      if (performance.now() < touchUntil) return { x: px, y: py + y0 - top, real: true };
      return { x: W / 2, y: H * 0.56 + y0 - top, real: false };
    };
    const inArea = (x: number, y: number, pad: number) =>
      x > area.x - pad && x < area.x + area.w + pad && y > area.y - pad && y < area.y + area.h + pad;

    // a tap on the night: an eye takes offence, or bats burst out of it
    const onTap = (e: PointerEvent) => {
      if ((e.target as Element).closest("a,button,[role=button],input,label")) return;
      const x = e.clientX;
      const y = e.clientY + scrollY() - top;
      if (!inArea(x, y, 0)) return;
      for (const eye of eyes) {
        if (Math.hypot(eye.x - x, eye.y - y) < eye.r + 16) {
          eye.shutUntil = performance.now() + 2600;
          buzz(12);
          troll("eye-poke", TROLL.poke);
          return;
        }
      }
      burst(x, y, 5);
    };
    /** bats out of a point, in section coordinates */
    function burst(x: number, y: number, n: number) {
      for (let i = 0; i < n; i++) {
        const a = rand(-Math.PI * 0.95, -Math.PI * 0.05);
        const v = rand(170, 300);
        flock.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, p: rand(0, 4), w: batWidth() * 0.8, life: 2.4, dir: Math.sign(Math.cos(a)) || 1 });
      }
    }
    // anything in the section can ask for bats: dispatch "soon:bats" with { x, y } on screen
    const onBats = (e: Event) => {
      const d = (e as CustomEvent<{ x: number; y: number; n?: number }>).detail;
      if (d) burst(d.x, d.y + scrollY() - top, d.n ?? 8);
    };
    section.addEventListener("pointerdown", onTap, { passive: true });
    section.addEventListener("soon:bats", onBats);

    // --- the frame -------------------------------------------------------------------------
    let visible = false;
    let blank = false;
    const draw = (_t: number, dms: number) => {
      if (!visible || document.hidden || root.dataset.idle === "true" || isNavActive() || root.dataset.wipe || root.dataset.wiping || curtainUp()) return;
      const dt = Math.min(0.05, (dms || 16.7) / 1000);
      const now = performance.now();
      const y0 = scrollY();
      const oy = top - y0;
      const f = focus();

      // nothing alive and nothing left on the canvas: leave it alone, so an
      // empty canvas doesn't cost a full-screen clear every frame
      const empty = !flock.length && !eyes.length;
      if (empty && blank) return;
      blank = empty;

      ctx.clearRect(0, 0, W, H);
      const onScreen = (y: number, pad = 80) => y + oy > -pad && y + oy < H + pad;

      // bats: flap about their bit of sky, turn at its edges, scatter from you
      const left = area.x + spanL * area.w + 24;
      const right = area.x + spanR * area.w - 24;
      const bandTop = area.y + skyTop * area.h;
      const bandBot = area.y + skyBot * area.h;
      for (let i = flock.length - 1; i >= 0; i--) {
        const b = flock[i];
        b.t += dt;
        if (b.life >= 0) {
          b.life -= dt;
          if (b.life <= 0) {
            flock.splice(i, 1);
            continue;
          }
        } else {
          if (b.x < left) b.dir = 1;
          if (b.x > right) b.dir = -1;
          b.vy += Math.sin(b.t * 1.4 + b.p) * 22 * dt;
          if (b.y < bandTop) b.vy += 70 * dt;
          if (b.y > bandBot) b.vy -= 70 * dt;
          b.vy *= 0.985;
          b.vx += (b.dir * 70 - b.vx) * dt * 0.7;
        }
        const bx = b.x - f.x;
        const by = b.y - f.y;
        const bd = Math.hypot(bx, by) || 1;
        if (f.real && bd < 170) {
          b.vx += (bx / bd) * 900 * dt;
          b.vy += (by / bd) * 900 * dt;
        }
        const sp = Math.hypot(b.vx, b.vy);
        if (sp > 320) {
          b.vx *= 320 / sp;
          b.vy *= 320 / sp;
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (!onScreen(b.y)) continue;
        const beat = BEAT[Math.floor(b.t * (sp > 140 ? 18 : 10) + b.p) % 4];
        const frame = wings[beat];
        if (!frame.ok) continue;
        const w = b.w;
        const h = w * batRatio;
        ctx.save();
        ctx.globalAlpha = b.life >= 0 ? Math.min(1, b.life) : 1;
        ctx.translate(b.x, b.y + oy + (beat === 0 ? -2 : beat === 2 ? 2 : 0));
        ctx.rotate(Math.max(-0.35, Math.min(0.35, b.vx / 520)));
        ctx.drawImage(frame.canvas, -w / 2, -h / 2, w, h);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // the eyes in the ink: follow you a little, shut when you're too close
      for (const e of eyes) {
        if (!onScreen(e.y)) continue;
        const d = Math.hypot(e.x - f.x, e.y - f.y);
        if (f.real && d < e.r + 110) e.shutUntil = Math.max(e.shutUntil, now + 900);
        const shut = now < e.shutUntil;
        if (shut !== e.shut) {
          e.shut = shut;
          if (shut) e.el.dataset.shut = "true";
          else delete e.el.dataset.shut;
        }
        const reach = Math.max(2, e.r * 0.08);
        const lx = Math.max(-1, Math.min(1, (f.x - e.x) / 320)) * reach;
        const ly = Math.max(-1, Math.min(1, (f.y - e.y) / 320)) * reach * 0.6;
        if (Math.abs(lx - e.lx) > 0.25 || Math.abs(ly - e.ly) > 0.25) {
          e.lx = lx;
          e.ly = ly;
          e.el.style.translate = `${lx.toFixed(1)}px ${ly.toFixed(1)}px`;
        }
      }
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        measure();
        if (!flock.length) seed();
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    });
    io.observe(section);

    size();
    measure();
    seed();
    const onResize = () => {
      size();
      measure();
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(() => measure());
    ro.observe(section);
    ScrollTrigger.addEventListener("refresh", measure);
    gsap.ticker.add(draw);
    // the device stepped down: the night goes still, and stays that way
    const stopDrop = onTierDrop(() => {
      gsap.ticker.remove(draw);
      ctx.clearRect(0, 0, W, H);
    });

    return () => {
      dead = true;
      stopDrop();
      gsap.ticker.remove(draw);
      io.disconnect();
      ro.disconnect();
      ScrollTrigger.removeEventListener("refresh", measure);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      section.removeEventListener("pointerdown", onTap);
      section.removeEventListener("soon:bats", onBats);
      for (const e of eyes) {
        e.el.style.translate = "";
        delete e.el.dataset.shut;
      }
    };
  }, [bats, skyTop, skyBot, spanL, spanR, zone]);

  return (
    <div ref={wrap} className={`soon-critters ${className}`} aria-hidden="true">
      <canvas ref={canvas} className="soon-critters-canvas" />
    </div>
  );
}
