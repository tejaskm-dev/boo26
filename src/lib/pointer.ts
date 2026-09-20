"use client";

/**
 * One motion source for the whole page.
 *
 * Components subscribe and drive their own GSAP quickTo setters, so movement
 * never triggers a React render. Values are normalised to -1..1, where -1 is
 * the left/top of the viewport and 1 the right/bottom.
 *
 * On desktop that source is the mouse. On mobile devices that source is device
 * tilt / gyroscope with adaptive baseline calibration and touch interaction.
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
  if (e.pointerType === "mouse") {
    x = (e.clientX / window.innerWidth) * 2 - 1;
    y = (e.clientY / window.innerHeight) * 2 - 1;
    schedule();
  }
}

/* ------------------------------------------------------------------ *
 * Device tilt & mobile parallax
 * ------------------------------------------------------------------ */

// Reference natural holding posture in portrait: ~50° pitch, 0° roll
const TARGET_RESTING_PITCH = 50;
const TARGET_RESTING_ROLL = 0;

let baseline = { beta: TARGET_RESTING_PITCH, gamma: TARGET_RESTING_ROLL };
let hasFirstReading = false;

// Soft S-curve so tilting feels smooth, natural, and never hits a hard wall
function softNorm(val: number, range: number): number {
  return Math.tanh(val / range);
}

function getOrientationAngle(): number {
  if (typeof window === "undefined") return 0;
  if (window.screen?.orientation && typeof window.screen.orientation.angle === "number") {
    return window.screen.orientation.angle;
  }
  if (typeof window.orientation === "number") {
    return window.orientation;
  }
  return 0;
}

function onTilt(e: DeviceOrientationEvent) {
  const { beta, gamma } = e;
  if (beta === null || gamma === null) return;

  // First reading: seed baseline close to user's current posture
  if (!hasFirstReading) {
    hasFirstReading = true;
    baseline.beta = Math.max(25, Math.min(75, beta));
    baseline.gamma = Math.max(-30, Math.min(30, gamma));
  }

  // Adaptive center-drift: slowly migrate resting baseline so posture shifts never peg the parallax
  baseline.beta += (beta - baseline.beta) * 0.005;
  baseline.gamma += (gamma - baseline.gamma) * 0.005;

  const dBeta = beta - baseline.beta;
  const dGamma = gamma - baseline.gamma;

  // Handle device orientation (landscape left/right)
  const angle = getOrientationAngle();
  let rawX = dGamma;
  let rawY = dBeta;

  if (angle === 90) {
    rawX = dBeta;
    rawY = -dGamma;
  } else if (angle === -90 || angle === 270) {
    rawX = -dBeta;
    rawY = dGamma;
  } else if (angle === 180) {
    rawX = -dGamma;
    rawY = -dBeta;
  }

  // Smooth S-curve normalization: ~18° roll, ~22° pitch
  const targetX = softNorm(rawX, 18);
  const targetY = softNorm(rawY, 22);

  // Smooth lerp (0.14) for fluid responsiveness without jitter
  x += (targetX - x) * 0.14;
  y += (targetY - y) * 0.14;
  schedule();
}

export function canTilt(): boolean {
  return typeof window !== "undefined" && "DeviceOrientationEvent" in window;
}

let tiltActive = false;

/**
 * Robust cross-platform orientation enabler:
 * - On Android & desktop: activates immediately.
 * - On iOS: waits for user gesture (click / touchend / pointerup) as required by WebKit.
 */
export async function enableTilt(): Promise<boolean> {
  if (tiltActive || !canTilt()) return tiltActive;

  const DOE = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<"granted" | "denied">;
  };

  // iOS Safari requires requestPermission inside a user gesture
  if (typeof DOE.requestPermission === "function") {
    try {
      const state = await DOE.requestPermission();
      if (state !== "granted") {
        return false;
      }
      try {
        sessionStorage.setItem("boo-tilt-granted", "true");
      } catch {}
    } catch {
      // Gesture token missing or prompt dismissed; allow subsequent attempts
      return false;
    }
  }

  tiltActive = true;
  window.addEventListener("deviceorientation", onTilt, { passive: true });
  return true;
}

/** Recalibrates current holding posture as the center. */
export function recalibrateTilt() {
  hasFirstReading = false;
  baseline = { beta: TARGET_RESTING_PITCH, gamma: TARGET_RESTING_ROLL };
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
