"use client";

import { useEffect, useRef } from "react";
import { useFinePointer } from "@/lib/motion";
import { scrollPageTo } from "@/lib/lenis";

const MIN_THUMB = 52;

/**
 * The native bar is hidden and replaced with a thread and a lime bead. It is a
 * real control, not a read-out: drag the bead, or click anywhere on the thread
 * to travel there. The bead stretches a little with scroll speed, which is the
 * same liquid language as the drips in the wordmark.
 *
 * Only rendered for a mouse — touch platforms already overlay their own bar and
 * hide it when idle.
 */
export default function Scrollbar() {
  const fine = useFinePointer();
  const rail = useRef<HTMLDivElement>(null);
  const bead = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fine) return;
    const railEl = rail.current;
    const beadEl = bead.current;
    if (!railEl || !beadEl) return;

    let railH = 0;
    let thumbH = MIN_THUMB;
    let maxScroll = 1;
    let queued = 0;
    let dragging = false;
    let grabOffset = 0;
    let lastTop = 0;
    let lastTime = 0;

    const measure = () => {
      const doc = document.documentElement;
      railH = railEl.clientHeight;
      maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const ratio = window.innerHeight / doc.scrollHeight;
      thumbH = Math.max(MIN_THUMB, Math.round(railH * ratio));
      beadEl.style.height = `${thumbH}px`;
      railEl.dataset.idle = doc.scrollHeight <= window.innerHeight + 4 ? "true" : "false";
      paint();
    };

    const paint = () => {
      queued = 0;
      const top = window.scrollY;
      const progress = Math.min(1, Math.max(0, top / maxScroll));
      const y = progress * (railH - thumbH);

      // speed stretches the bead, the way the drips do
      const now = performance.now();
      const dt = Math.max(16, now - lastTime);
      const speed = Math.min(1, (Math.abs(top - lastTop) / dt) * 0.22);
      lastTop = top;
      lastTime = now;

      beadEl.style.transform = `translate3d(-50%, ${y}px, 0) scale(${1 - speed * 0.2}, ${
        1 + speed * 0.38
      })`;
    };

    const onScroll = () => {
      if (queued) return;
      queued = requestAnimationFrame(paint);
    };

    // --- dragging the bead
    const onBeadDown = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragging = true;
      grabOffset = e.clientY - beadEl.getBoundingClientRect().top;
      beadEl.setPointerCapture(e.pointerId);
      railEl.dataset.dragging = "true";
      document.body.style.userSelect = "none";
    };

    const onBeadMove = (e: PointerEvent) => {
      if (!dragging) return;
      const railTop = railEl.getBoundingClientRect().top;
      const travel = railH - thumbH;
      const progress = travel <= 0 ? 0 : (e.clientY - railTop - grabOffset) / travel;
      scrollPageTo(Math.min(1, Math.max(0, progress)) * maxScroll, true);
    };

    const onBeadUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      beadEl.releasePointerCapture(e.pointerId);
      delete railEl.dataset.dragging;
      document.body.style.userSelect = "";
    };

    // --- clicking the thread travels there
    const onRailDown = (e: PointerEvent) => {
      const railTop = railEl.getBoundingClientRect().top;
      const travel = railH - thumbH;
      const progress = travel <= 0 ? 0 : (e.clientY - railTop - thumbH / 2) / travel;
      scrollPageTo(Math.min(1, Math.max(0, progress)) * maxScroll);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    beadEl.addEventListener("pointerdown", onBeadDown);
    beadEl.addEventListener("pointermove", onBeadMove);
    beadEl.addEventListener("pointerup", onBeadUp);
    beadEl.addEventListener("pointercancel", onBeadUp);
    railEl.addEventListener("pointerdown", onRailDown);

    return () => {
      if (queued) cancelAnimationFrame(queued);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      ro.disconnect();
      beadEl.removeEventListener("pointerdown", onBeadDown);
      beadEl.removeEventListener("pointermove", onBeadMove);
      beadEl.removeEventListener("pointerup", onBeadUp);
      beadEl.removeEventListener("pointercancel", onBeadUp);
      railEl.removeEventListener("pointerdown", onRailDown);
      document.body.style.userSelect = "";
    };
  }, [fine]);

  if (!fine) return null;

  return (
    <div ref={rail} className="scrollrail" aria-hidden="true">
      <span className="scrollrail-thread" />
      <div ref={bead} className="scrollrail-bead" />
    </div>
  );
}
