"use client";

/**
 * One pointer listener for the whole page. Components subscribe and drive their
 * own GSAP quickTo setters, so pointer movement never triggers a React render.
 * Values are normalised to -1..1 from the centre of the viewport.
 */
type Listener = (x: number, y: number) => void;

const listeners = new Set<Listener>();
let attached = false;
let frame = 0;
let x = 0;
let y = 0;

function flush() {
  frame = 0;
  for (const fn of listeners) fn(x, y);
}

function onMove(e: PointerEvent) {
  if (e.pointerType !== "mouse") return;
  x = (e.clientX / window.innerWidth) * 2 - 1;
  y = (e.clientY / window.innerHeight) * 2 - 1;
  if (!frame) frame = requestAnimationFrame(flush);
}

export function subscribePointer(fn: Listener) {
  listeners.add(fn);
  if (!attached && typeof window !== "undefined") {
    attached = true;
    window.addEventListener("pointermove", onMove, { passive: true });
  }
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0 && attached) {
      attached = false;
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

/** Last known pointer position, for components mounting mid-session. */
export const pointer = {
  get x() { return x; },
  get y() { return y; },
};
