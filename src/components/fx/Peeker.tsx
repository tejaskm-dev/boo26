"use client";

import { useEffect, useRef } from "react";
import Sprite from "@/components/ui/Sprite";
import { prefersReducedMotion } from "@/lib/motion";
import { buzz } from "@/components/soon/troll";

/**
 * Something keeps following you down the page — the teaser's Peeker,
 * without its sound, for the full site's cream sections.
 *
 * Stop scrolling for a while on the cream and, now and then, a cat's head
 * comes up at the bottom of the screen and watches you with one eye. Move
 * toward it, or scroll, and it's gone — except once, when it comes at you
 * instead. Once a visit a door at the edge of the screen creaks open
 * instead, and someone checks you're still alive in there.
 *
 * Never more than a few times a visit, never often, never on the ink (there's
 * enough in the dark). Two fixed pieces moved by transform; when nothing's
 * peeking, nothing's running. With motion turned down, it stays away.
 */
export default function Peeker({ lines, door }: { /** what it says if you hover it, one at random */ lines: readonly string[]; door: string }) {
  const cat = useRef<HTMLDivElement>(null);
  const doorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const catEl = cat.current;
    const doorEl = doorRef.current;
    if (!catEl || !doorEl || prefersReducedMotion()) return;
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    let idle = 0;
    let away = 0;
    let peeks = 0;
    let doorDone = false;
    let lastPeek = 0;
    let showing: HTMLElement | null = null;

    /** a cream section across the middle of the screen, or nothing */
    const onCream = () => {
      const mid = window.innerHeight / 2;
      for (const s of document.querySelectorAll<HTMLElement>("main section[data-field='bone']")) {
        const r = s.getBoundingClientRect();
        if (r.top < mid && r.bottom > mid) return true;
      }
      return false;
    };

    const hide = () => {
      window.clearTimeout(away);
      if (!showing) return;
      delete showing.dataset.on;
      showing = null;
    };

    const peek = () => {
      if (!onCream() || document.hidden || showing || document.documentElement.dataset.navActive === "true") return;
      const now = Date.now();
      if (now - lastPeek < 24000 || peeks >= 4) return;
      lastPeek = now;
      // the door, once, after the cat's been up at least once
      if (!doorDone && peeks >= 1) {
        doorDone = true;
        peeks += 1;
        showing = doorEl;
        doorEl.dataset.on = "true";
        away = window.setTimeout(hide, 4200);
        return;
      }
      peeks += 1;
      showing = catEl;
      catEl.dataset.side = Math.random() < 0.5 ? "left" : "right";
      catEl.dataset.note = lines[Math.floor(Math.random() * lines.length)] ?? "";
      catEl.dataset.on = "true";
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
  }, [lines]);

  return (
    <>
      <div ref={cat} className="fx-peeker" aria-hidden="true">
        <Sprite name="cat-oneeye" scale={1.1} zoom={2.6} />
      </div>
      <div ref={doorRef} className="fx-door" aria-hidden="true">
        <p className="fx-door-line hand">{door}</p>
        <Sprite name="door-peek" scale={1.15} />
      </div>
    </>
  );
}
