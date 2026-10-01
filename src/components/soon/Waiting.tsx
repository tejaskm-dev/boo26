"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion, whenOpen } from "@/lib/motion";
import { WAIT } from "@/lib/soon";

/** the hero's narrowed eyes, in a 134x68 box (as InkEyes) */
const EYES = [
  "M7 5 57 47C45 63 19 61 9 47 2 38 4 15 7 5Z",
  "M127 27 77 63C87 79 113 77 123 63 130 54 129 37 127 27Z",
];

/** a blob of ink, in a 100x100 box — the wait runs round its edge from the top */
const BLOB = "M52 5C77 4 95 21 95 47C95 74 77 95 49 94C23 93 5 76 6 49C7 23 27 6 52 5Z";

/** the keys that scroll a page (as hold.ts) */
const KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar"]);

/** stopped this long partway through a pinned scene, and it tells you to keep going */
const IDLE = 1600;

type Scene = {
  /** its pinned stretch, as ScrollTrigger reads it */
  start: string;
  end: string;
  /** what it says if you stop in it, or it lets you go in it — null says nothing */
  line: (el: HTMLElement, p: number) => string | null;
};

/** the pinned scenes, by their data-wait */
const SCENES: Record<string, Scene> = {
  // a title card: the black, from when it's down to when it lifts (as Cut.tsx)
  cut: { start: "top 85%", end: "bottom 55%", line: () => WAIT.idle.cut },
  room: {
    start: "top top",
    end: "bottom bottom",
    line: (el) => (el.querySelector<HTMLElement>("[data-cat]")?.dataset.cat === "awake" ? WAIT.idle.woke : WAIT.idle.room),
  },
  freeze: { start: "top top", end: "bottom bottom", line: () => WAIT.idle.freeze },
  // the last shot: once the ask is up, it leaves you to it
  drop: { start: "top top", end: "bottom bottom", line: (_, p) => (p < 0.36 ? WAIT.idle.drop : null) },
};

type Live = { scene: HTMLElement; kind: Scene; st: ScrollTrigger };

/**
 * The eyes in the corner — there only while the page won't move on: while
 * a moment holds it still (hold.ts), or while a scene is pinned and the
 * scrolling seems to do nothing.
 *
 * A blob of ink opposite the sound switch, with the hero's eyes in it and
 * a lime line round its edge. Held, the line fills on its own for exactly
 * as long as the hold, and when it closes the eyes shut and you're let go.
 * In a pinned scene the line is how far through it you are. Scroll while
 * it's holding and it glares and says so ("not yet."); stop in a pinned
 * scene and it tells you to keep going, in that scene's own words (the
 * room says "tiptoe", until the cat's awake). The first time it holds you
 * it says "wait for it…"; after that it lets the line do the talking.
 *
 * Nothing in it re-renders: it's one fixed element and a handful of data
 * attributes, and soon.css does the rest.
 */
export default function Waiting() {
  const root = useRef<HTMLDivElement>(null);
  const blob = useRef<HTMLDivElement>(null);
  const burst = useRef<HTMLSpanElement>(null);
  const ring = useRef<SVGPathElement>(null);
  const note = useRef<HTMLParagraphElement>(null);
  const words = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const body = blob.current;
    const rim = burst.current;
    const line = ring.current;
    const bubble = note.current;
    const text = words.current;
    if (!el || !body || !rim || !line || !bubble || !text) return;
    gsap.registerPlugin(ScrollTrigger);
    const still = prefersReducedMotion();
    const length = line.getTotalLength() || 300;
    line.style.strokeDasharray = `${length} ${length}`;
    line.style.strokeDashoffset = `${length}`;

    let mode: "off" | "held" | "free" | "run" = "off";
    /** the hold's clock, running the line round */
    let fill: Animation | null = null;
    let since = 0;
    let lastTry = 0;
    /** tries this hold, and ever — each try says something different */
    let tried = false;
    let tries = 0;
    let first = true;
    let moved = 0;
    const live: Live[] = [];
    const top = () => live[live.length - 1];
    const timers = { note: 0, idle: 0, beat: 0, off: 0, glare: 0 };
    const clear = (...keys: (keyof typeof timers)[]) => keys.forEach((k) => window.clearTimeout(timers[k]));

    const eyes = (state: "open" | "glare" | "shut" | "down") => {
      if (el.dataset.eyes !== state) el.dataset.eyes = state;
    };
    const show = (m: typeof mode) => {
      mode = m;
      el.dataset.mode = m;
    };
    const say = (words: string | null, arrow = false, ms = 0) => {
      clear("note");
      if (!words) {
        delete el.dataset.note;
        return;
      }
      const changed = el.dataset.note === "true" && text.textContent !== words;
      text.textContent = words;
      el.dataset.arrow = arrow ? "true" : "false";
      el.dataset.note = "true";
      if (changed && !still) bubble.animate([{ transform: "scale(0.86)" }, { transform: "scale(1)" }], { duration: 320, easing: "cubic-bezier(0.2, 1.4, 0.4, 1)" });
      if (ms) timers.note = window.setTimeout(() => delete el.dataset.note, ms);
    };

    /** the line, by hand: p of the way round */
    const draw = (p: number, now = false) => {
      if (now) line.style.transition = "none";
      line.style.strokeDashoffset = String(length * (1 - Math.min(1, Math.max(0, p))));
      if (now) requestAnimationFrame(() => (line.style.transition = ""));
    };
    /** take the line back from the hold's clock — closed, as it ends */
    const unclock = () => {
      if (!fill) return;
      fill.cancel();
      fill = null;
      line.style.strokeDashoffset = "0";
    };

    const off = () => {
      clear("idle", "beat", "off", "glare");
      say(null);
      show("off");
    };

    // --- a pinned scene: the line is how far through it you are
    const idleCheck = () => {
      const s = top();
      if (mode !== "run" || !s || s.st.progress > 0.97) return;
      const words = s.kind.line(s.scene, s.st.progress);
      if (words) say(words, true);
    };
    const armIdle = (ms = IDLE) => {
      clear("idle");
      timers.idle = window.setTimeout(idleCheck, ms);
    };
    const run = () => {
      const s = top();
      if (!s) return off();
      clear("off");
      const from = mode;
      show("run");
      unclock();
      draw(s.st.progress, from === "off");
      eyes("down");
      armIdle();
    };

    // --- held: the line runs round on the hold's own clock
    const onPush = (e: Event) => {
      if (mode !== "held") return;
      if (e instanceof KeyboardEvent && !KEYS.has(e.key)) return;
      if (e instanceof WheelEvent && Math.abs(e.deltaY) + Math.abs(e.deltaX) < 4) return;
      const now = performance.now();
      // the fling that ran into it is still settling for a moment, and that
      // isn't a try; after that, keep pushing and it answers every so often
      if (now - since < 450 || now - lastTry < 1300) return;
      lastTry = now;
      tried = true;
      say(WAIT.push[tries++ % WAIT.push.length], false, 1500);
      eyes("glare");
      clear("glare");
      timers.glare = window.setTimeout(() => mode === "held" && eyes("open"), 700);
      if (!still) {
        body.animate(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-4px) rotate(-5deg)" },
            { transform: "translateX(4px) rotate(4deg)" },
            { transform: "translateX(-2px) rotate(-2deg)" },
            { transform: "translateX(0)" },
          ],
          { duration: 380, easing: "ease-out" },
        );
      }
    };
    const listen = (on: boolean) => {
      for (const type of ["wheel", "touchmove", "keydown"] as const) {
        if (on) window.addEventListener(type, onPush, { passive: true });
        else window.removeEventListener(type, onPush);
      }
    };
    const held = (ms: number) => {
      clear("idle", "beat", "off", "glare");
      fill?.cancel();
      fill = null;
      show("held");
      since = performance.now();
      lastTry = 0;
      tried = false;
      eyes("open");
      draw(0, true);
      fill = line.animate([{ strokeDashoffset: `${length}` }, { strokeDashoffset: "0" }], { duration: ms, easing: "linear", fill: "forwards" });
      say(first ? WAIT.first : null, false, Math.min(2200, ms - 200));
      first = false;
      listen(true);
    };
    const letGo = () => {
      listen(false);
      if (mode !== "held") return;
      unclock();
      eyes("shut");
      if (!still) {
        body.animate([{ transform: "scale(1)" }, { transform: "scale(1.16)" }, { transform: "scale(1)" }], { duration: 460, easing: "cubic-bezier(0.2, 1.4, 0.4, 1)" });
        rim.animate([{ transform: "scale(0.95)", opacity: 0.9 }, { transform: "scale(2)", opacity: 0 }], { duration: 700, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" });
      }
      show("free");
      // a beat with them shut — then, if you're still in a pinned scene, it
      // shows how far; and if you'd been trying (or haven't moved since), go
      timers.beat = window.setTimeout(() => {
        if (mode !== "free") return;
        const s = top();
        const words = s ? s.kind.line(s.scene, s.st.progress) : WAIT.go;
        if (s) run();
        else eyes("down");
        if (tried) {
          if (words) say(words, true, s ? 0 : 1800);
        } else if (s) {
          armIdle(1100);
        } else {
          timers.idle = window.setTimeout(() => {
            if (mode === "free" && performance.now() - moved > 1000) say(WAIT.go, true, 1700);
          }, 1100);
        }
        if (!s) timers.off = window.setTimeout(off, tried ? 2100 : 2900);
      }, 320);
    };
    // a frame late: the frame a hold starts in is the busiest there is
    // (the scene's own slam, and the halt that has to reach the screen)
    let next = 0;
    const onHold = (e: Event) => {
      const d = (e as CustomEvent<{ held: boolean; ms?: number }>).detail;
      cancelAnimationFrame(next);
      if (d.held) next = requestAnimationFrame(() => held(Math.max(400, (d.ms ?? 2000) - 16)));
      else letGo();
    };

    // --- moving
    const onScroll = () => {
      moved = performance.now();
      if (mode === "free") {
        // on your way: it's done
        if (top()) run();
        else off();
      } else if (mode === "run") {
        if (el.dataset.note === "true") say(null);
        armIdle();
      }
    };

    let sts: ScrollTrigger[] = [];
    const stop = whenOpen(() => {
      sts = [...document.querySelectorAll<HTMLElement>("[data-wait]")].flatMap((scene) => {
        const kind = SCENES[scene.dataset.wait ?? ""];
        if (!kind) return [];
        return [
          ScrollTrigger.create({
            trigger: scene,
            start: kind.start,
            end: kind.end,
            onToggle: (self) => {
              const i = live.findIndex((s) => s.st === self);
              // a scene that's gone, or too short to pin (motion turned down),
              // isn't one — a hidden one measures as nothing, wherever it is
              const pinned = scene.offsetHeight > 0 && self.end - self.start > window.innerHeight * 0.25;
              if (self.isActive && i < 0 && pinned) live.push({ scene, kind, st: self });
              if (!self.isActive && i >= 0) live.splice(i, 1);
              // a hold has it until it lets go, and then it looks again
              if (mode === "held" || mode === "free") return;
              if (live.length) run();
              else if (mode === "run") off();
            },
            onUpdate: (self) => {
              if (mode === "run" && top()?.st === self) draw(self.progress);
            },
          }),
        ];
      });
    });

    window.addEventListener("soon:hold", onHold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      stop();
      sts.forEach((st) => st.kill());
      listen(false);
      window.removeEventListener("soon:hold", onHold);
      window.removeEventListener("scroll", onScroll);
      Object.values(timers).forEach((t) => window.clearTimeout(t));
      cancelAnimationFrame(next);
      fill?.cancel();
    };
  }, []);

  return (
    <div ref={root} className="soon-wait" data-mode="off" aria-hidden="true">
      <p ref={note} className="soon-wait-note hand">
        <span ref={words} />
        <svg viewBox="0 0 16 30" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
          <path d="M8 1v26M2.5 21.5 8 28l5.5-6.5" />
        </svg>
      </p>
      <div ref={blob} className="soon-wait-blob">
        <svg viewBox="0 0 100 100">
          <path d={BLOB} className="soon-wait-body" />
          <path ref={ring} d={BLOB} className="soon-wait-ring" />
        </svg>
        <span ref={burst} className="soon-wait-burst" />
        <span className="soon-wait-eyes">
          <svg viewBox="0 0 134 68">
            {EYES.map((d) => (
              <path key={d} d={d} />
            ))}
          </svg>
        </span>
      </div>
    </div>
  );
}
