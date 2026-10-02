"use client";

import { useEffect, useRef } from "react";
import { cue } from "./sound";

/**
 * The lines hidden on things. Hover anything marked `data-secret` with a
 * mouse and a small note appears just above it; on a phone, a long press
 * does the same. The system cursor is left alone.
 *
 * One fixed note for the whole page, placed when it's needed (one layout read
 * per hover, never per frame) and hidden again on the way out or on scroll.
 */
export default function HoverNotes() {
  const note = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = note.current;
    const textEl = text.current;
    if (!el || !textEl) return;
    let host: Element | null = null;
    let press = 0;
    let hideAt = 0;
    let startX = 0;
    let startY = 0;

    const place = (x: number, y: number) => {
      const w = el.offsetWidth || 180;
      const left = Math.min(window.innerWidth - w / 2 - 12, Math.max(w / 2 + 12, x));
      el.style.translate = `${Math.round(left)}px ${Math.round(Math.max(72, y))}px`;
    };
    const show = (target: Element, secret: string, x?: number, y?: number) => {
      host = target;
      textEl.textContent = secret;
      if (x === undefined || y === undefined) {
        const r = target.getBoundingClientRect();
        place(r.left + r.width / 2, r.top - 10);
      } else {
        place(x, y - 70);
      }
      el.dataset.on = "true";
      cue("tick");
    };
    const hide = () => {
      host = null;
      delete el.dataset.on;
    };

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const target = (e.target as Element).closest<HTMLElement>("[data-secret]");
      if (!target) {
        if (host) hide();
        return;
      }
      if (target !== host) show(target, target.dataset.secret ?? "");
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !host) return;
      const to = e.relatedTarget as Element | null;
      if (!to || !host.contains(to)) hide();
    };

    // a phone: press and hold
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const target = (e.target as Element).closest<HTMLElement>("[data-secret]");
      if (!target) return;
      startX = e.clientX;
      startY = e.clientY;
      window.clearTimeout(press);
      press = window.setTimeout(() => {
        show(target, target.dataset.secret ?? "", startX, startY);
        window.clearTimeout(hideAt);
        hideAt = window.setTimeout(hide, 2600);
      }, 420);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && Math.hypot(e.clientX - startX, e.clientY - startY) > 12) window.clearTimeout(press);
    };
    const onUp = () => window.clearTimeout(press);
    const onScroll = () => {
      if (host) hide();
    };

    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(press);
      window.clearTimeout(hideAt);
    };
  }, []);

  return (
    <div ref={note} className="soon-hint" aria-hidden="true">
      <p ref={text} className="hand" />
    </div>
  );
}
