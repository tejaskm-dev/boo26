"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";
import { isTouch } from "@/lib/tier";
import { curtain } from "@/lib/curtain";
import { MU } from "@/lib/soon";
import InkEyes from "./InkEyes";
import MuLearn from "./MuLearn";
import { hold } from "./hold";
import { cue, lineLength, say, type Line } from "./sound";

/** where eyes open in the dark while the card is up */
const DARK_EYES: { at: string; tilt: number }[] = [
  { at: "left-[8%] top-[18%] w-[3rem] md:w-[4.6rem]", tilt: -8 },
  { at: "left-[80%] top-[24%] w-[2.2rem] md:w-[3.4rem]", tilt: 7 },
  { at: "left-[14%] top-[72%] w-[2.4rem] md:w-[3.6rem]", tilt: 5 },
  { at: "left-[74%] top-[78%] w-[2.8rem] md:w-[4.2rem]", tilt: -6 },
  { at: "left-[46%] top-[88%] hidden w-[2rem] md:block", tilt: 3 },
];

/** how long each line has before the next comes up, in ms */
const STEP = 950;
/**
 * The studio card, like the top of a trailer: it comes up, holds, goes
 * — all the way to black — and only then the first line. In ms: when it
 * starts to go, and when the first line comes up out of the black.
 */
const PRESENTS_OUT = 1500;
const PRESENTS = 2350;
/** said out loud, the beat after each line before the next, in ms */
const BREATH = 160;

/** which letters of a line run, how far, and when */
function drips(line: string, i: number) {
  const letters = [...line].map((ch, k) => ({ ch, k })).filter(({ ch }) => /[A-Z]/i.test(ch));
  if (!letters.length) return new Map<number, { long: number; delay: number; x: number }>();
  const picks = [0.2, 0.58, 0.88].slice(0, line.length > 8 ? 3 : 2);
  return new Map(
    picks.map((at, j) => {
      const k = letters[Math.min(letters.length - 1, Math.floor(at * letters.length) + ((i + j) % 2))].k;
      return [k, { long: 0.55 + ((i * 7 + j * 5) % 5) * 0.14, delay: 0.32 + j * 0.24, x: ((i + j * 3) % 5) * 0.03 - 0.06 }] as const;
    }),
  );
}

/** a line's words, each knowing where its first letter sits in the line */
function words(line: string) {
  let at = 0;
  return line.split(" ").map((text) => {
    const w = { text, at };
    at += text.length + 1;
    return w;
  });
}

/**
 * A cut between acts — a scene of its own, a screen and a bit long (on a
 * phone, a moment at the seam between them: see below).
 *
 * The picture fades to black; the film flickers; eyes open round the edge
 * of the frame; and the lines come up one at a time in the BOO! brush, each
 * letter dropping in like a blob of the lockup's goo and landing soft, and
 * then running — drips sliding off the bottom of the letters, in their own
 * colour, the last line in lime. The next act fades in behind it.
 *
 * Once the card is up, the page holds still for as long as the lines take
 * (hold.ts), so a quick flick can't skip it. The lines play on their own
 * clock either way, so the scroll never makes them stutter. Come back up
 * through it and it says something else (`back`) — held for that too. Leave
 * it either way and it resets, ready to play again. With motion turned down
 * there's no cut.
 *
 * With the sound on, a line can be said out loud as it comes up (`voices`,
 * one for each of `lines`, and `backVoices` for `back`) — every time it
 * does, not just the first — and then each gets as long as it takes to say,
 * and is held for.
 */
export default function Cut({
  lines,
  back = [],
  voices = [],
  backVoices = [],
  presents = false,
}: {
  lines: readonly string[];
  back?: readonly string[];
  /** what's said as each of `lines` comes up, if anything */
  voices?: readonly (Line | null)[];
  /** and as each of `back` does */
  backVoices?: readonly (Line | null)[];
  /** open on the studio card — "µLearn ASIET presents" — the way a trailer does */
  presents?: boolean;
}) {
  const room = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const eyes = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = room.current;
    const veilEl = veil.current;
    const cardEl = card.current;
    const eyesEl = eyes.current;
    if (!el || !veilEl || !cardEl || !eyesEl || prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    const down = [...cardEl.querySelectorAll<HTMLElement>("[data-row]")];
    const up = [...cardEl.querySelectorAll<HTMLElement>("[data-row-back]")];
    const studio = veilEl.querySelector<HTMLElement>("[data-presents]");
    let timers: number[] = [];
    let playing: "down" | "up" | null = null;
    let breathed = false;
    /** held for it this visit — on the way down, and on the way back up */
    let caught = false;
    let caughtUp = false;
    /** one of its holds has the page (easing it back, or holding it) */
    let mine = false;
    /**
     * The studio card's been seen through, this visit. It's the top of the
     * trailer, once: come down through again (nothing holds you then) and
     * the lines come straight up, so they're seen and said, not scrolled
     * past while the logo's still up.
     */
    let opened = false;
    /** where the last update had it (or which end it was left by): a step through it, or clean past it? */
    let lastP = -1;

    /**
     * When it all happens, this time through, in ms: when each line comes
     * up, and when the last one's done. With nothing to say, a line every
     * STEP; said out loud, each gets as long as it takes to say. Worked out
     * once a play, so the hold and the lines agree.
     */
    type Plan = { way: "down" | "up"; at: number[]; end: number };
    let plan: Plan | null = null;
    const planFor = (way: "down" | "up"): Plan => {
      if (plan?.way === way) return plan;
      const rows = way === "down" ? down : up;
      const said = way === "down" ? voices : backVoices;
      // on the way down, the studio card comes first (the first time)
      let t = studio && way === "down" && !opened ? PRESENTS : 0;
      const at = rows.map((_, i) => {
        const now = t;
        const line = said[i];
        const long = line ? Math.round(lineLength(line) * 1000) : 0;
        t += Math.max(STEP, long && long + BREATH);
        return now;
      });
      plan = { way, at, end: t };
      return plan;
    };

    /** when this play started: a hold that catches it later holds only for what's left */
    let playedAt = 0;
    const play = (way: "down" | "up") => {
      if (playing) return;
      playing = way;
      playedAt = performance.now();
      cardEl.dataset.way = way;
      // eyes open round the frame for as long as it plays
      eyesEl.dataset.look = "true";
      const rows = way === "down" ? down : up;
      const said = way === "down" ? voices : backVoices;
      const { at } = planFor(way);
      const opening = studio && way === "down" && !opened;
      if (opening) {
        // the studio's logo comes up out of the dark, opens its eyes, holds,
        // and goes — a beat of black — before the first line
        studio.dataset.on = "true";
        cue("toll");
        timers.push(window.setTimeout(() => (studio.dataset.muOpen = "true"), 550));
        timers.push(window.setTimeout(() => (studio.dataset.gone = "true"), PRESENTS_OUT));
      }
      rows.forEach((row, i) => {
        timers.push(
          window.setTimeout(() => {
            if (!row.isConnected) return;
            row.dataset.on = "true";
            if (i > 0) rows[i - 1].dataset.past = "true";
            if (opening) opened = true;
            const line = said[i];
            const spoken = line ? say(line) > 0 : false;
            // after the studio card, the cold open comes in on a whisper (or
            // is one, said out loud)
            if (i === 0 && !spoken) cue(studio && way === "down" ? "whisper" : "toll");
          }, at[i]),
        );
      });
    };
    const reset = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
      playing = null;
      plan = null;
      eyesEl.dataset.look = "false";
      for (const row of [...down, ...up]) {
        row.dataset.on = "false";
        row.dataset.past = "false";
      }
      if (studio) {
        studio.dataset.on = "false";
        studio.dataset.gone = "false";
        studio.dataset.muOpen = "false";
      }
    };

    const key = (way: "down" | "up") => (way === "up" ? `cut-up:${lines.join("|")}` : `cut:${lines.join("|")}`);
    /** how long it's held once its last line is up, in ms: that line's own moment to be read */
    const tail = (way: "down" | "up") => (way === "up" ? 600 : 700);

    // On a phone the card is a moment at the seam between two acts, not a
    // stretch of page. Scrolled through, it was a screen and a half of
    // swiping in the dark — most of it after the card had said its piece —
    // and its black came up a whole screen early, over the end of the act
    // before, which went unseen (01's file, 03's "Make them look twice").
    // Now its page is barely a gap (soon.css), the black comes up as the
    // seam reaches the middle of the screen, whichever way you're going, and
    // the page is held still for exactly as long as the card takes. The
    // moment it's said its piece the black goes, wherever you are, and you
    // carry on from the seam. The page scrolls on its own thread there and
    // the script hears about it late, so nothing here follows the scroll:
    // it only says when, and the fade is the browser's own, on the
    // compositor (soon.css).
    if (isTouch()) {
      veilEl.dataset.fade = "clock";
      let shown = false;
      let early = 0;
      let gone = 0;
      let done = 0;
      /** played out at this seam: its black has gone, and stays gone until you've left the seam */
      let over = false;
      /** the page being measured again (the phone turned round): it moves under you, and that's no fling */
      let refreshing = false;
      const show = (on: boolean) => {
        if (on === shown) return;
        shown = on;
        veilEl.dataset.shown = on ? "true" : "false";
        // its film (grain, flicker, the eyes' blinks) runs only while it's up
        veilEl.dataset.on = on ? "true" : "false";
        // and what's behind the black rests while it's up
        curtain(on);
        window.clearTimeout(gone);
        // once it's all the way gone, it's ready to play again — never while
        // it's still up with its lines taken off it
        if (!on)
          gone = window.setTimeout(() => {
            if (shown || mine) return;
            reset();
          }, 560);
      };
      /** off the seam: the black goes, and it's ready to play again */
      const leave = () => {
        window.clearTimeout(early);
        window.clearTimeout(done);
        over = false;
        show(false);
      };
      /** the card, from the top: the black, the lines, and the hold while they're said */
      const begin = (way: "down" | "up", band: ScrollTrigger, past = false) => {
        if (over) return;
        const w = way === "up" && up.length ? "up" : "down";
        // (back on it a moment after leaving it, before it had reset: worked out again)
        if (playing) plan = null;
        // a beat for the black to come up, the lines, and the last one's moment
        const ms = 250 + planFor(w).end + tail(w);
        const from = performance.now();
        const finish = () => {
          window.clearTimeout(done);
          over = true;
          show(false);
        };
        // held while it plays, once a visit each way: anywhere in the first
        // part of the seam's stretch, eased back to it only if a fling ran on
        // past
        let held = false;
        if (w === "up" ? !caughtUp : !caught) {
          const into = (f: number) => (w === "down" ? band.start + (band.end - band.start) * f : band.end - (band.end - band.start) * f);
          const [a, b] = [into(0.04), into(0.6)];
          // (brought back, its time starts once it's there: the card's already going)
          held = hold(key(w), past ? ms - 600 : ms, {
            ...(past ? { to: into(0.3), glide: 0.6 } : { range: [Math.min(a, b), Math.max(a, b)] as [number, number] }),
            way: w,
            tail: tail(w),
            onRelease: () => {
              mine = false;
              // let go in its last moment (you moved on): so does the black
              if (performance.now() - from >= ms - tail(w) - 50) finish();
              // and let go off the seam (the menu took the page, say): it's been left
              if (!band.isActive) leave();
            },
          });
          if (held) {
            mine = true;
            if (w === "up") caughtUp = true;
            else caught = true;
          }
        }
        // flung clean past it in one frame, it's brought back for it — and if
        // it can't be (a jump, the menu), it's simply left behind
        if (past && !held) return;
        // (back on it a moment after leaving it, before it had reset: from the top)
        if (playing) {
          window.clearTimeout(gone);
          reset();
        }
        show(true);
        cue("inhale");
        window.clearTimeout(early);
        window.clearTimeout(done);
        early = window.setTimeout(() => shown && !playing && play(w), 250);
        done = window.setTimeout(finish, ms);
      };
      // the seam crossing the middle of the screen: down past 64% of the way
      // down it, up past 30% — the same stretch, from either end
      const seam = ScrollTrigger.create({
        trigger: el,
        start: "center 64%",
        end: "center 30%",
        // (while its hold has the page, the page is only ever on its way back
        // to the seam: a fling that ran on out of it before it stopped, or
        // the ease bringing it back in, is neither leaving it nor arriving —
        // and coming back in from below isn't coming up through it)
        onToggle: (self) => mine || (self.isActive ? begin(self.direction < 0 ? "up" : "down", self) : leave()),
        onUpdate: (self) => {
          const p = self.progress;
          const was = lastP;
          lastP = p;
          // a fling (a slow phone, a busy moment) that went clean past the
          // seam in one frame still gets the card: the hold brings it back
          // for it. A jump (a link) isn't held, and is simply left behind —
          // and nor is the page moving under you (the phone turned round)
          if (self.isActive || was < 0 || mine || refreshing) return;
          if (was <= 0 && p >= 1 && !caught) begin("down", self, true);
          else if (was >= 1 && p <= 0 && !caughtUp && up.length) begin("up", self, true);
        },
        onRefreshInit: () => {
          refreshing = true;
        },
        // which side of it the page is on from the start: the first fling
        // clean past it is the one that matters most
        onRefresh: (self) => {
          refreshing = false;
          lastP = self.progress;
        },
      });
      return () => {
        window.clearTimeout(early);
        window.clearTimeout(gone);
        window.clearTimeout(done);
        if (shown) curtain(false);
        seam.kill();
        timers.forEach((t) => window.clearTimeout(t));
      };
    }

    // With a mouse or a trackpad the black follows the scroll, darker the
    // further in, and the card is a stretch of page of its own.
    veilEl.dataset.fade = "scroll";
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      // gone before the next act's words come up
      end: "bottom 55%",
      onToggle: (self) => {
        const { isActive } = self;
        if (!isActive) lastP = self.progress >= 0.5 ? 1 : 0;
        veilEl.style.visibility = isActive ? "visible" : "hidden";
        veilEl.dataset.on = isActive ? "true" : "false";
      },
      onUpdate: (self) => {
        const p = self.progress;
        const was = lastP < 0 ? (self.direction < 0 ? 1 : 0) : lastP;
        lastP = p;
        // dark in, hold, dark out
        veilEl.style.opacity = String(Math.max(0, Math.min(1, p / 0.18, (1 - p) / 0.22)));
        if (!breathed && p > 0.06) {
          breathed = true;
          cue("inhale");
        }
        // while one of its holds has the page, the card plays on as it is —
        // the ease back can start from past either end, which would otherwise
        // reset it and replay the other way's lines
        if (mine) return;
        const goingUp = self.direction < 0;
        const range = self.end - self.start;
        // the card's up: hold the page while it says its piece — on the way
        // down at a third of the way in, and on the way back up (where it
        // says something else) at a third of the way from the bottom
        // caught on it, it's held wherever it came to rest in the stretch
        // where the black's all the way up (eased back to it only if it
        // overshot); flung clean past it, it's brought back to it
        const holdFor = (way: "down" | "up", past = false) => {
          const at = way === "up" ? 0.64 : 0.36;
          const stretch: [number, number] = way === "up" ? [0.38, 0.74] : [0.26, 0.62];
          // for what's left of it — and once it's all been said, not at all
          const left = playing === way ? planFor(way).end - (performance.now() - playedAt) : planFor(way).end;
          if (left < 400) return false;
          const ok = hold(key(way), left + tail(way), {
            ...(past
              ? { to: self.start + range * at, glide: 0.7 }
              : { range: [self.start + range * stretch[0], self.start + range * stretch[1]] as [number, number] }),
            way,
            tail: tail(way),
            onRelease: () => (mine = false),
          });
          if (!ok) {
            // (not playing yet: worked out again when it does)
            if (!playing) plan = null;
            return false;
          }
          mine = true;
          if (way === "up") caughtUp = true;
          else caught = true;
          return true;
        };
        // a fling that went clean past it in one frame (a slow phone, a busy
        // moment) still gets the card, either way: the hold brings it back
        // for it. A jump (a link) isn't held, and then it's simply left behind.
        // Only one that skipped it, though: a page that went through it while
        // it played and wasn't caught (it had just turned round, or the menu
        // put it there) has seen it, and isn't dragged back for it.
        if (!playing && (goingUp ? !caughtUp && up.length > 0 && p <= 0.2 && was > 0.8 : !caught && p >= 0.8 && was < 0.2)) {
          if (holdFor(goingUp ? "up" : "down", true)) play(goingUp ? "up" : "down");
          return;
        }
        if (!playing && p > 0.2 && p < 0.8) play(goingUp && up.length ? "up" : "down");
        // caught while it's playing, in the stretch it plays in — not on the
        // way out of it, which would only ease the page back again
        if (playing === "down" && p > 0.2 && p < 0.8 && !caught) holdFor("down");
        if (playing === "up" && p > 0.2 && p < 0.8 && !caughtUp) holdFor("up");
        // left behind, either way: ready to play again (on the way out of it only)
        if (goingUp ? p < 0.08 : p > 0.96) {
          reset();
          breathed = false;
        }
      },
    });
    return () => {
      st.kill();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [lines, back, voices, backVoices]);

  return (
    <div ref={room} className="soon-cut-room" data-wait="cut" aria-hidden="true">
      <div ref={veil} className="soon-cut">
        <span className="soon-cut-grain" />
        <span className="soon-cut-flicker" />
        <div ref={eyes} data-look="false" className="absolute inset-0">
          {DARK_EYES.map((e, i) => (
            <InkEyes key={i} className={e.at} tilt={e.tilt} blink={4 + i} delay={i * 0.12} />
          ))}
        </div>
        {/* the studio card: its own shot, in the middle of the black */}
        {presents ? (
          <div data-presents data-on="false" data-gone="false" className="soon-presents">
            <MuLearn alive={false} className="w-[min(64vw,24rem)]" />
            <span className="label soon-presents-word">{MU.presents}</span>
          </div>
        ) : null}
        <div ref={card} className="soon-cut-card" data-way="down">
          {[
            ...lines.map((line, k) => ({ line, attr: "data-row", last: k === lines.length - 1 })),
            ...back.map((line, k) => ({ line, attr: "data-row-back", last: k === back.length - 1 })),
          ].map(({ line, attr, last }, i) => {
            const goo = drips(line, i);
            return (
              <p key={line} {...{ [attr]: "" }} data-last={last ? "" : undefined} data-on="false" data-past="false" className="soon-goo brush">
                {words(line).map((w, wi) => (
                  <span key={wi}>
                    {wi > 0 ? " " : null}
                    <span className="soon-goo-w">
                      {[...w.text].map((ch, n) => {
                        const k = w.at + n;
                        const d = goo.get(k);
                        return (
                          <span key={k} className="soon-goo-l" data-tilt={(k * 37) % 5} style={{ "--i": k } as React.CSSProperties}>
                            {ch}
                            {d ? (
                              <span className="soon-drip-at">
                                <span
                                  className="soon-drip"
                                  style={{ "--long": d.long, "--d": `${d.delay + k * 0.04}s`, "--x": `${d.x}em` } as React.CSSProperties}
                                >
                                  <b />
                                  <i />
                                </span>
                              </span>
                            ) : null}
                          </span>
                        );
                      })}
                    </span>
                  </span>
                ))}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
