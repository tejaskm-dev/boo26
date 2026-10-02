"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";
import { BACK, SECRETS, SOON } from "@/lib/soon";
import InkEyes from "./InkEyes";
import { onBacktrack } from "./backtrack";
import { cue } from "./sound";
import { buzz } from "./troll";

/**
 * Where each link of the chain sits in the night — its eyes, and its words
 * on the far side of them — on a phone, then on a laptop (lg:). Down the
 * dark from side to side, smaller further off, the last one close and big.
 */
const LINKS = [
  {
    eyes: "left-[7%] top-[16%] w-[2.7rem] lg:left-[30%] lg:top-[14%] lg:w-[3.4rem]",
    words: "left-[27%] top-[13.5%] text-left lg:left-[43%] lg:top-[12%]",
    tilt: -8,
  },
  {
    eyes: "left-[73%] top-[30%] w-[3.1rem] lg:left-[72%] lg:top-[29%] lg:w-[3.9rem]",
    words: "right-[31%] top-[27.5%] text-right lg:right-[33%] lg:top-[27%]",
    tilt: 7,
  },
  {
    eyes: "left-[9%] top-[44%] w-[2.5rem] lg:left-[22%] lg:top-[43%] lg:w-[3.1rem]",
    words: "left-[27%] top-[41.5%] text-left lg:left-[34%] lg:top-[41%]",
    tilt: -4,
  },
  {
    eyes: "left-[70%] top-[58%] w-[3.4rem] lg:left-[67%] lg:top-[57%] lg:w-[4.4rem]",
    words: "right-[34%] top-[55.5%] text-right lg:right-[38%] lg:top-[55%]",
    tilt: 9,
  },
  {
    eyes: "left-1/2 top-[70%] w-[5.4rem] -translate-x-1/2 lg:top-[69%] lg:w-[7rem]",
    words: "inset-x-0 top-[80%] text-center lg:top-[81%]",
    tilt: 0,
  },
];

/** how long the rumour takes to get from one pair of eyes to the next, in s */
const TRAVEL = 0.75;

/**
 * 01's night: one rumour, passed along a chain of eyes in the dark.
 *
 * As you scroll in, a lime thread draws itself from one pair of eyes to the
 * next with the rumour running along it — a bead of lime — and each pair
 * opens as it arrives and says its line, a little different from the last
 * ("psst. it's not a seminar." … "says who?" … "…the cats."). The last pair
 * is close, and big, and looks right at you. However fast you scroll, it's
 * passed on one link at a time.
 *
 * Come back up after the room and the rumour has turned (BACK.rumour) — and
 * the file below has changed its story too ("soon:back:heard").
 *
 * The lines are a real list for anyone not looking; the eyes and the thread
 * are decoration. Cheap: the thread is drawn only while it travels, in a
 * layer of its own, and nothing is measured while you scroll. With motion
 * turned down it's all simply there.
 */
export default function Rumour() {
  const t = SOON.heard;
  const root = useRef<HTMLDivElement>(null);
  const [back, setBack] = useState(false);
  const lines = back ? BACK.rumour : t.rumour;

  useEffect(() => {
    const el = root.current;
    const section = el?.closest("section");
    if (!el || !section) return;
    return onBacktrack(section, () => {
      setBack(true);
      window.dispatchEvent(new Event("soon:back:heard"));
    });
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const links = [...el.querySelectorAll<HTMLElement>("[data-link]")];
    const eyes = links.map((l) => l.querySelector<HTMLElement>(".soon-inkeyes"));
    const segs = [...el.querySelectorAll<SVGPathElement>("[data-seg]")];
    const thread = el.querySelector<SVGSVGElement>("[data-thread]");
    const bead = el.querySelector<HTMLElement>("[data-bead]");
    if (!thread || !bead || eyes.some((e) => !e)) return;
    const n = links.length;
    const lengths: number[] = [];

    // the chain's geometry: measured when the layout changes, never while scrolling
    const measure = () => {
      const box = el.getBoundingClientRect();
      thread.setAttribute("viewBox", `0 0 ${Math.round(box.width)} ${Math.round(box.height)}`);
      const at = eyes.map((e) => {
        const r = e!.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      });
      segs.forEach((seg, k) => {
        const a = at[k];
        const b = at[k + 1];
        const dy = b.y - a.y;
        seg.setAttribute("d", `M${a.x} ${a.y}C${a.x} ${a.y + dy * 0.62} ${b.x} ${b.y - dy * 0.62} ${b.x} ${b.y}`);
        lengths[k] = seg.getTotalLength();
        seg.style.strokeDasharray = `${lengths[k]} ${lengths[k]}`;
        seg.style.strokeDashoffset = seg.dataset.drawn === "true" ? "0" : `${lengths[k]}`;
      });
    };
    measure();

    const say = (k: number) => {
      links.forEach((l, i) => {
        if (i === k) {
          l.dataset.said = "true";
          l.dataset.latest = "true";
        } else delete l.dataset.latest;
      });
    };

    if (prefersReducedMotion()) {
      segs.forEach((seg) => {
        seg.dataset.drawn = "true";
        seg.style.strokeDashoffset = "0";
      });
      links.forEach((l) => (l.dataset.said = "true"));
      say(n - 1);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    let reached = -1;
    let shown = -1;
    let busy = false;
    let dead = false;
    // passed by while nobody was looking (a link, a fling): it's simply all there
    let seen = false;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    io.observe(el);
    const finish = () => {
      tween?.kill();
      bead.dataset.on = "false";
      segs.forEach((seg) => {
        seg.dataset.drawn = "true";
        seg.style.strokeDashoffset = "0";
      });
      links.forEach((l) => (l.dataset.said = "true"));
      say(n - 1);
      shown = n - 1;
      busy = false;
    };
    const timers: number[] = [];
    let tween: gsap.core.Tween | null = null;

    // the rumour runs along the thread to the next pair, drawing it as it goes
    const travel = (k: number, done: () => void) => {
      const seg = segs[k];
      const len = lengths[k] || seg.getTotalLength();
      bead.dataset.on = "true";
      const run = { p: 0 };
      tween = gsap.to(run, {
        p: 1,
        duration: TRAVEL,
        ease: "power2.inOut",
        onUpdate: () => {
          seg.style.strokeDashoffset = String(len * (1 - run.p));
          const pt = seg.getPointAtLength(len * run.p);
          bead.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0)`;
        },
        onComplete: () => {
          seg.dataset.drawn = "true";
          bead.dataset.on = "false";
          done();
        },
      });
    };
    const arrive = (k: number) => {
      say(k);
      cue("whisper");
      if (k === n - 1) {
        // the last of them is close, and it's looking right at you
        buzz(16);
        eyes[k]?.animate([{ scale: "1" }, { scale: "1.16" }, { scale: "1" }], { duration: 700, delay: 350, easing: "cubic-bezier(0.2, 1.4, 0.4, 1)" });
      }
    };
    // one link at a time, however fast you got here
    const step = () => {
      if (dead || shown >= reached) {
        busy = false;
        return;
      }
      if (!seen) return finish();
      busy = true;
      const k = shown + 1;
      const next = () => {
        arrive(k);
        shown = k;
        timers.push(window.setTimeout(step, 420));
      };
      if (k === 0) next();
      else travel(k - 1, next);
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 70%",
      end: "bottom 55%",
      onUpdate: ({ progress }) => {
        const k = Math.min(n - 1, Math.floor(progress * n * 1.08));
        if (k > reached) {
          reached = k;
          if (!busy) step();
        }
      },
    });

    // poke a pair of eyes that's said its piece, and they shut on you
    const onPoke = (e: PointerEvent) => {
      eyes.forEach((eye, k) => {
        if (!eye || links[k].dataset.said !== "true" || eye.dataset.shut) return;
        const r = eye.getBoundingClientRect();
        if (e.clientX < r.left - 16 || e.clientX > r.right + 16 || e.clientY < r.top - 16 || e.clientY > r.bottom + 16) return;
        eye.dataset.shut = "true";
        buzz(10);
        timers.push(window.setTimeout(() => delete eye.dataset.shut, 1200));
      });
    };
    el.addEventListener("pointerdown", onPoke);

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      dead = true;
      st.kill();
      tween?.kill();
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointerdown", onPoke);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <div ref={root} className="soon-rumour absolute inset-0">
      <svg data-thread aria-hidden="true" className="soon-rumour-thread absolute inset-0 h-full w-full overflow-visible">
        {LINKS.slice(1).map((_, k) => (
          <path key={k} data-seg={k} />
        ))}
      </svg>
      <span data-bead data-on="false" aria-hidden="true" className="soon-rumour-bead" />
      <ul aria-label={t.label}>
        {lines.map((line, k) => {
          const at = LINKS[k];
          const last = k === lines.length - 1;
          return (
            <li key={k} data-link={k} className="pointer-events-none absolute inset-0">
              <InkEyes className={at.eyes} tilt={at.tilt} blink={4.6 + k * 0.9} />
              <p
                data-secret={SECRETS.rumour[k]}
                className={`soon-rumour-line hand absolute ${last ? "soon-rumour-last" : "max-w-[15ch]"} ${at.words}`}
              >
                {line.split(" ").map((w, i) => (
                  <span key={i}>
                    {i > 0 ? " " : null}
                    <span className="soon-rumour-w" style={{ "--i": i } as React.CSSProperties}>
                      {w}
                    </span>
                  </span>
                ))}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
