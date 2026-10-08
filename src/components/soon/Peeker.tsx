"use client";

import { useEffect, useRef } from "react";
import Sprite from "@/components/ui/Sprite";
import { prefersReducedMotion } from "@/lib/motion";
import { TROLL } from "@/lib/soon";
import { cue } from "./sound";
import { buzz } from "./troll";

/**
 * Something keeps following you down the page.
 *
 * Stop scrolling for a while in one of the cream rooms and, now and then, a
 * cat's head comes up at the bottom of the screen and watches you with one
 * eye. Move toward it, or scroll, and it's gone. Once a visit, a door at the
 * edge of the screen creaks open instead, and someone asks how you're doing.
 *
 * Never more than a few times a visit, never often, never in the dark room
 * (there's enough in there). Two fixed pieces moved by transform; when
 * nothing's peeking, nothing's running. With motion turned down, it stays
 * away.
 */
export default function Peeker() {
  const cat = useRef<HTMLDivElement>(null);
  const door = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const catEl = cat.current;
    const doorEl = door.current;
    if (!catEl || !doorEl || prefersReducedMotion()) return;
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    let idle = 0;
    let away = 0;
    let peeks = 0;
    let doorDone = false;
    let lastPeek = 0;
    let showing: HTMLElement | null = null;

    const where = () => {
      const mid = window.innerHeight / 2;
      for (const id of ["heard", "point", "not-yet"]) {
        const r = document.getElementById(id)?.getBoundingClientRect();
        if (r && r.top < mid && r.bottom > mid) return id;
      }
      return null;
    };

    const hide = () => {
      window.clearTimeout(away);
      if (!showing) return;
      delete showing.dataset.on;
      showing = null;
    };

    const peek = () => {
      const room = where();
      if (!room || document.hidden || showing) return;
      const now = Date.now();
      if (now - lastPeek < 24000 || peeks >= 4) return;
      lastPeek = now;
      // the door, once, in the word screens or at the end
      if (!doorDone && room !== "heard") {
        doorDone = true;
        peeks += 1;
        showing = doorEl;
        doorEl.dataset.on = "true";
        cue("creak");
        away = window.setTimeout(hide, 4200);
        return;
      }
      peeks += 1;
      showing = catEl;
      catEl.dataset.side = Math.random() < 0.5 ? "left" : "right";
      catEl.dataset.secret = Math.random() < 0.5 ? TROLL.peek : TROLL.hello;
      catEl.dataset.on = "true";
      cue("whisper");
      away = window.setTimeout(hide, 2600);
      onShow();
    };

    // stop scrolling for a few seconds, and it comes
    const wait = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(peek, coarse ? 3800 : 4600);
    };
    const onScroll = () => {
      hide();
      wait();
    };
    // go toward it and it ducks — except once, when it comes at you instead
    let lunged = false;
    const lunge = (el: HTMLElement) => {
      lunged = true;
      window.clearTimeout(away);
      el.dataset.lunge = "true";
      cue("hiss", true);
      buzz(60);
      away = window.setTimeout(() => {
        delete el.dataset.lunge;
        hide();
      }, 700);
    };
    const onMove = (e: PointerEvent) => {
      if (!showing || e.pointerType !== "mouse" || showing.dataset.lunge) return;
      const r = showing.getBoundingClientRect();
      if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < 180) {
        if (!lunged && showing === catEl) lunge(catEl);
        else hide();
      }
    };
    // on a phone there's no going toward it: it lunges on its own, the second time
    const onShow = () => {
      if (coarse && !lunged && peeks >= 2 && showing === catEl) window.setTimeout(() => showing === catEl && lunge(catEl), 1500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    wait();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      window.clearTimeout(idle);
      window.clearTimeout(away);
    };
  }, []);

  return (
    <>
      <div ref={cat} className="soon-peeker" data-secret={TROLL.peek} aria-hidden="true">
        <Sprite name="cat-oneeye" scale={1.1} zoom={2.6} />
      </div>
      <div ref={door} className="soon-door" aria-hidden="true">
        <p className="soon-door-line hand">{TROLL.winning}</p>
        <Sprite name="door-peek" scale={1.15} />
      </div>
    </>
  );
}
