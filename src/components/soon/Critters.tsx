"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/motion";
import { isNavActive } from "@/lib/navState";
import { SPRITE } from "@/lib/sprites";
import { TROLL } from "@/lib/soon";
import { buzz, troll } from "./troll";

type Bat = { x: number; y: number; vx: number; vy: number; t: number; p: number; w: number; life: number; dir: number };
type Wisp = { hx: number; hy: number; x: number; y: number; t: number; p: number; r: number; orbit: number; kick: number };
type Ghost = { x: number; y: number; vx: number; t: number; p: number; w: number; a: number; gone: number; dir: number };
type Mist = { x: number; y: number; vx: number; vy: number; life: number };
type Eye = { el: HTMLElement; x: number; y: number; r: number; shut: boolean; shutUntil: number; lx: number; ly: number };
type Glow = { el: HTMLElement; x: number; y: number; o: number };
type Box = { x: number; y: number; w: number; h: number };

/** the bat's wingbeat, as the frames it cycles through: up, level, down, level */
const BEAT = [0, 1, 2, 1];

/**
 * The night's living things: the cat-bats out of the artwork flapping about
 * and scattering from you, will-o'-the-wisps that come and circle you, the
 * sheet ghost keeping its distance (tap it and it puffs away), the eyes in
 * the ink narrowing at you and shutting when you get too close, and the
 * rumours that only read clearly near you.
 *
 * They keep to one area of the section — the element matching `zone`,
 * usually the ink field the night lives in — and fall back to the whole
 * section when there isn't one.
 *
 * "You" is the cursor on a laptop. On a phone it's your finger while it's on
 * the glass, and otherwise the middle of the screen — so scrolling alone
 * brings the wisps along and brings the whispers up as they pass.
 *
 * Cheap on purpose: one canvas the size of the screen, fixed and clipped to
 * the section (the way the torch's dark is), drawn only while the section is
 * on screen and the page is being looked at. The artwork is scaled down once
 * into small bitmaps when it loads, so a frame is a few dozen small image
 * draws. Nothing here reads layout per frame: positions are measured when the
 * layout changes. With motion turned down it doesn't run at all.
 */
export default function Critters({
  bats = 6,
  wisps = 12,
  ghosts = 1,
  sky = [0.04, 0.42],
  ground = [0.7, 0.94],
  zone = "[data-night]",
  className = "",
}: {
  bats?: number;
  wisps?: number;
  ghosts?: number;
  /** the band the bats fly in, as fractions of the zone's height */
  sky?: [number, number];
  /** where the wisps hang about when nobody's near */
  ground?: [number, number];
  /** the part of the section they keep to */
  zone?: string;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  // as numbers, so a parent re-rendering with a fresh array doesn't restart the night
  const [skyTop, skyBot] = sky;
  const [groundTop, groundBot] = ground;

  useEffect(() => {
    const cv = canvas.current;
    const section = wrap.current?.closest("section");
    if (!cv || !section || prefersReducedMotion()) return;
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
    const glow = document.createElement("canvas");
    glow.width = glow.height = 64;
    const g = glow.getContext("2d")!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(216,255,40,0.9)");
    grad.addColorStop(0.25, "rgba(216,255,40,0.35)");
    grad.addColorStop(1, "rgba(216,255,40,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);

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
    const ghostRatio = SPRITE.ghost.h / SPRITE.ghost.w;
    const wings = [SPRITE["bat-up"], SPRITE["bat-level"], SPRITE["bat-down"]].map((s) => bitmap(s.src, 96, batRatio));
    const sheet = bitmap(SPRITE.ghost.src, 96, ghostRatio);

    // --- geometry: measured on layout changes only -------------------------------
    let W = 0;
    let H = 0;
    let top = 0;
    let sw = 1;
    let sh = 1;
    let area: Box = { x: 0, y: 0, w: 1, h: 1 };
    let small = false;
    let eyes: Eye[] = [];
    let glows: Glow[] = [];
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
      glows = [...section.querySelectorAll<HTMLElement>("[data-whisper]")]
        .filter((el) => el.offsetParent !== null)
        .map((el) => ({ el, ...at(el), o: -1 }));
    };

    // --- the population ------------------------------------------------------------
    const flock: Bat[] = [];
    const lights: Wisp[] = [];
    const spooks: Ghost[] = [];
    const mist: Mist[] = [];
    const batWidth = () => (small ? rand(40, 58) : rand(54, 86));
    const seed = () => {
      flock.length = 0;
      lights.length = 0;
      spooks.length = 0;
      for (let i = 0; i < bats; i++) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        flock.push({
          x: area.x + rand(0.1, 0.9) * area.w,
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
      for (let i = 0; i < wisps; i++) {
        const hx = area.x + rand(0.06, 0.94) * area.w;
        const hy = area.y + rand(groundTop, groundBot) * area.h;
        lights.push({ hx, hy, x: hx, y: hy, t: rand(0, 9), p: rand(0, 6.28), r: rand(2, 3.6), orbit: rand(34, 120), kick: 0 });
      }
      for (let i = 0; i < ghosts; i++) {
        const dir = i % 2 ? -1 : 1;
        spooks.push({
          x: area.x + rand(0.15, 0.85) * area.w,
          y: area.y + rand(0.3, 0.7) * area.h,
          vx: rand(16, 28) * dir,
          t: rand(0, 9),
          p: rand(0, 6),
          w: small ? rand(50, 62) : rand(64, 86),
          a: 0,
          gone: 0,
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

    // a tap on the night: the ghost pops, an eye takes offence, or bats burst out of it
    const onTap = (e: PointerEvent) => {
      if ((e.target as Element).closest("a,button,[role=button],input,label")) return;
      const x = e.clientX;
      const y = e.clientY + scrollY() - top;
      for (const gh of spooks) {
        if (gh.gone > 0) continue;
        if (Math.hypot(gh.x - x, gh.y - y) < gh.w * 0.6 + 14) {
          gh.gone = 4 + rand(0, 3);
          for (let i = 0; i < 18; i++) {
            const a = (i / 18) * Math.PI * 2;
            mist.push({ x: gh.x, y: gh.y, vx: Math.cos(a) * rand(30, 100), vy: Math.sin(a) * rand(30, 100) - 24, life: 1 });
          }
          buzz(20);
          troll("ghost-pop", TROLL.boo);
          return;
        }
      }
      for (const eye of eyes) {
        if (Math.hypot(eye.x - x, eye.y - y) < eye.r + 16) {
          eye.shutUntil = performance.now() + 2600;
          buzz(12);
          troll("eye-poke", TROLL.poke);
          return;
        }
      }
      for (let i = 0; i < 5; i++) {
        const a = rand(-Math.PI * 0.95, -Math.PI * 0.05);
        const v = rand(170, 290);
        flock.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, p: rand(0, 4), w: batWidth() * 0.8, life: 2.4, dir: Math.sign(Math.cos(a)) || 1 });
      }
      for (const w of lights) {
        if (Math.hypot(w.x - x, w.y - y) < 200) w.kick = 1;
      }
    };
    section.addEventListener("pointerdown", onTap, { passive: true });

    // --- the frame -------------------------------------------------------------------------
    let visible = false;
    const draw = (_t: number, dms: number) => {
      if (!visible || document.hidden || root.dataset.idle === "true" || isNavActive() || root.dataset.wipe || root.dataset.wiping) return;
      const dt = Math.min(0.05, (dms || 16.7) / 1000);
      const now = performance.now();
      const y0 = scrollY();
      const oy = top - y0;
      const f = focus();
      const near = f.real && inArea(f.x, f.y, 120);

      ctx.clearRect(0, 0, W, H);
      const onScreen = (y: number, pad = 80) => y + oy > -pad && y + oy < H + pad;

      // wisps: wander at home; come and circle you when you're in the night
      ctx.globalCompositeOperation = "lighter";
      for (const w of lights) {
        w.t += dt;
        let tx = w.hx + Math.sin(w.t * 0.5 + w.p) * 46;
        let ty = w.hy + Math.cos(w.t * 0.7 + w.p) * 22;
        const close = (near || (!f.real && inArea(f.x, f.y, 0))) && Math.hypot(w.x - f.x, w.y - f.y) < (f.real ? 340 : 260);
        if (close) {
          const a = w.p + w.t * (0.9 + w.r * 0.2);
          tx = f.x + Math.cos(a) * w.orbit;
          ty = f.y + Math.sin(a) * w.orbit * 0.62;
        }
        if (w.kick > 0) {
          tx += (w.x - f.x) * 2 * w.kick;
          ty += (w.y - f.y) * 2 * w.kick;
          w.kick = Math.max(0, w.kick - dt * 1.2);
        }
        // never out over the cream, where a glow is only a smudge
        tx = Math.max(area.x + 12, Math.min(area.x + area.w - 12, tx));
        ty = Math.max(area.y + area.h * 0.17, Math.min(area.y + area.h * 0.88, ty));
        const ease = Math.min(1, dt * (close ? 2.2 : 0.9));
        w.x += (tx - w.x) * ease;
        w.y += (ty - w.y) * ease;
        if (!onScreen(w.y)) continue;
        const a = 0.5 + 0.5 * Math.sin(w.t * 3.1 + w.p * 2);
        const r = w.r * (close ? 1.25 : 1);
        ctx.globalAlpha = 0.35 + a * 0.45;
        ctx.drawImage(glow, w.x - r * 7, w.y + oy - r * 7, r * 14, r * 14);
        ctx.globalAlpha = 0.65 + a * 0.35;
        ctx.drawImage(glow, w.x - r * 1.6, w.y + oy - r * 1.6, r * 3.2, r * 3.2);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // the ghost: drifts about the night, keeps its distance, comes back after a pop
      for (const gh of spooks) {
        gh.t += dt;
        if (gh.gone > 0) {
          gh.gone -= dt;
          if (gh.gone <= 0) {
            gh.dir = Math.random() < 0.5 ? -1 : 1;
            gh.x = gh.dir > 0 ? area.x + area.w * 0.1 : area.x + area.w * 0.9;
            gh.y = area.y + rand(0.3, 0.7) * area.h;
            gh.a = 0;
          }
          continue;
        }
        if (gh.x < area.x + area.w * 0.12) gh.dir = 1;
        if (gh.x > area.x + area.w * 0.88) gh.dir = -1;
        gh.vx += (gh.dir * 22 - gh.vx) * dt * 0.6;
        const fx = gh.x - f.x;
        const fy = gh.y - f.y;
        const fd = Math.hypot(fx, fy) || 1;
        const flee = f.real && fd < 220 ? (220 - fd) * 1.6 : 0;
        gh.x += (gh.vx + (fx / fd) * flee) * dt;
        gh.y += (Math.sin(gh.t * 0.9 + gh.p) * 14 + (fy / fd) * flee) * dt;
        gh.y = Math.max(area.y + area.h * 0.12, Math.min(area.y + area.h * 0.88, gh.y));
        // it's only ever half there, and less so when you're close
        const shy = f.real ? Math.max(0.35, Math.min(1, (fd - 60) / 200)) : 1;
        gh.a = Math.min(shy, gh.a + dt * 0.5);
        if (!onScreen(gh.y, 140) || !sheet.ok) continue;
        const w = gh.w;
        const h = w * ghostRatio;
        ctx.save();
        ctx.globalAlpha = gh.a * (0.78 + 0.12 * Math.sin(gh.t * 2 + gh.p));
        ctx.translate(gh.x, gh.y + oy + Math.sin(gh.t * 1.7) * 6);
        ctx.rotate(Math.sin(gh.t * 1.1 + gh.p) * 0.08 + gh.vx * 0.002);
        if (gh.vx < 0) ctx.scale(-1, 1);
        ctx.drawImage(sheet.canvas, -w / 2, -h / 2, w, h);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // the puff a popped ghost leaves
      ctx.fillStyle = "#f3f0e7";
      for (let i = mist.length - 1; i >= 0; i--) {
        const m = mist[i];
        m.life -= dt * 0.9;
        if (m.life <= 0) {
          mist.splice(i, 1);
          continue;
        }
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.vy -= 12 * dt;
        ctx.globalAlpha = m.life * 0.4;
        ctx.beginPath();
        ctx.arc(m.x, m.y + oy, 3 + (1 - m.life) * 11, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // bats: flap about their bit of sky, turn at its edges, scatter from you
      const left = area.x + 24;
      const right = area.x + area.w - 24;
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

      // the rumours, clearer near you
      for (const gl of glows) {
        const d = Math.hypot(gl.x - f.x, gl.y - f.y);
        const o = 0.18 + 0.82 * Math.max(0, Math.min(1, 1 - (d - 60) / 260));
        if (Math.abs(o - gl.o) > 0.03) {
          gl.o = o;
          gl.el.style.opacity = o.toFixed(2);
        }
      }
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        measure();
        if (!flock.length && !lights.length && !spooks.length) seed();
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

    return () => {
      dead = true;
      gsap.ticker.remove(draw);
      io.disconnect();
      ro.disconnect();
      ScrollTrigger.removeEventListener("refresh", measure);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      section.removeEventListener("pointerdown", onTap);
      for (const e of eyes) {
        e.el.style.translate = "";
        delete e.el.dataset.shut;
      }
    };
  }, [bats, wisps, ghosts, skyTop, skyBot, groundTop, groundBot, zone]);

  return (
    <div ref={wrap} className={`soon-critters ${className}`} aria-hidden="true">
      <canvas ref={canvas} className="soon-critters-canvas" />
    </div>
  );
}
