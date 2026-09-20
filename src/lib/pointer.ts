"use client";

/**
 * One motion source for the whole page.
 *
 * Components subscribe and drive their own GSAP quickTo setters, so movement
 * never triggers a React render. Values are normalised to -1..1, where -1 is
 * the left/top of the viewport and 1 the right/bottom.
 *
 * On a desktop that source is the mouse. On a phone there is no cursor, so the
 * same signal is taken from how the device is being held — the hero fields,
 * the sprite drift and the cat's pupils all read the tilt without knowing
 * anything changed. Orientation is levelled against however the phone was held
 * when the first reading arrived, so the page is not skewed to one side for
 * someone lying down, and it is smoothed because raw gyroscope output is noisy
 * enough to read as a shake.
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

function schedule() {
  if (!frame) frame = requestAnimationFrame(flush);
}

function onMove(e: PointerEvent) {
  if (e.pointerType !== "mouse") return;
  x = (e.clientX / window.innerWidth) * 2 - 1;
  y = (e.clientY / window.innerHeight) * 2 - 1;
  schedule();
}

/* ------------------------------------------------------------------ *
 * Device tilt
 * ------------------------------------------------------------------ */

/** how many degrees of tilt map to the full -1..1 range */
const TILT_RANGE = 26;
/** 0..1 — how much of each new reading is taken; the rest is the old value */
const SMOOTHING = 0.12;

let baseline: { beta: number; gamma: number } | null = null;

function onTilt(e: DeviceOrientationEvent) {
  const { beta, gamma } = e;
  if (beta === null || gamma === null) return;

  // level against however the device was being held at the first reading
  if (!baseline) baseline = { beta, gamma };

  const clamp = (v: number) => Math.max(-1, Math.min(1, v / TILT_RANGE));
  const tx = clamp(gamma - baseline.gamma);
  const ty = clamp(beta - baseline.beta);

  x += (tx - x) * SMOOTHING;
  y += (ty - y) * SMOOTHING;
  schedule();
}

function canTilt() {
  return typeof window !== "undefined" && "DeviceOrientationEvent" in window;
}

/**
 * iOS will not deliver orientation until it has been asked for inside a user
 * gesture, and asking twice throws. Android needs no permission and simply
 * starts firing. Both paths end at the same listener.
 */
let tiltRequested = false;

export async function enableTilt() {
  if (tiltRequested || !canTilt()) return false;
  tiltRequested = true;

  const DOE = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<"granted" | "denied">;
  };

  if (typeof DOE.requestPermission === "function") {
    try {
      if ((await DOE.requestPermission()) !== "granted") return false;
    } catch {
      return false;
    }
  }

  window.addEventListener("deviceorientation", onTilt, { passive: true });
  return true;
}

/** Drop the levelling so the next reading becomes the new rest position. */
export function recalibrateTilt() {
  baseline = null;
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

/** Last known position, for components mounting mid-session. */
export const pointer = {
  get x() { return x; },
  get y() { return y; },
};
