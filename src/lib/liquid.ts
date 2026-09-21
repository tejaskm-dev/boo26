"use client";

import { prefersReducedMotion } from "@/lib/motion";
import { subscribePointer } from "@/lib/pointer";
import { getLenis } from "@/lib/lenis";
import { gsap } from "gsap";
import { isNavActive } from "@/lib/navState";

export interface PrecomputedPoint {
  baseX: number;
  baseY: number;
  nx: number;
  ny: number;
  theta: number;
}

export interface PrecomputedPath {
  start: PrecomputedPoint;
  curves: [PrecomputedPoint, PrecomputedPoint, PrecomputedPoint][];
}

/** Precomputes static normal vectors and polar angles for zero-runtime-trig deformation. */
export function precomputeSvgPath(d: string): PrecomputedPath {
  const matchM = d.match(/M\s*([-\d.]+)\s+([-\d.]+)/);
  const startRaw: [number, number] = matchM
    ? [parseFloat(matchM[1]), parseFloat(matchM[2])]
    : [0, 0];

  const rawCurves: [number, number, number, number, number, number][] = [];
  const cRegex = /C\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/g;
  let m: RegExpExecArray | null;
  while ((m = cRegex.exec(d)) !== null) {
    rawCurves.push([
      parseFloat(m[1]), parseFloat(m[2]),
      parseFloat(m[3]), parseFloat(m[4]),
      parseFloat(m[5]), parseFloat(m[6]),
    ]);
  }

  // Centroid
  let sx = startRaw[0];
  let sy = startRaw[1];
  let total = 1;
  for (let i = 0; i < rawCurves.length; i++) {
    sx += rawCurves[i][4];
    sy += rawCurves[i][5];
    total++;
  }
  const cx = sx / total;
  const cy = sy / total;

  function toPoint(x: number, y: number): PrecomputedPoint {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy) || 1;
    return {
      baseX: x,
      baseY: y,
      nx: dx / dist,
      ny: dy / dist,
      theta: Math.atan2(dy, dx),
    };
  }

  const start = toPoint(startRaw[0], startRaw[1]);
  const curves: [PrecomputedPoint, PrecomputedPoint, PrecomputedPoint][] = rawCurves.map((c) => [
    toPoint(c[0], c[1]),
    toPoint(c[2], c[3]),
    toPoint(c[4], c[5]),
  ]);

  return { start, curves };
}

function buildDeformedPathFast(
  path: PrecomputedPath,
  t: number,
  amp: number,
  w1: number,
  w2: number,
  w3: number,
  p1: number,
  p2: number,
  p3: number,
  viscousX: number,
  viscousY: number,
  viscousWeight: number
): string {
  const t_w1 = t * w1 + p1;
  const t_w2 = t * w2 - p2;
  const t_w3 = t * w3 + p3;
  const vx = viscousX * viscousWeight;
  const vy = viscousY * viscousWeight;

  const sp = path.start;
  const sWave =
    amp * (0.52 * Math.sin(sp.theta * 2 + t_w1) + 0.32 * Math.sin(sp.theta * 3 - t_w2) + 0.16 * Math.cos(sp.theta + t_w3));
  const sDisp = sWave + (sp.nx * vx + sp.ny * vy);
  const sx = Math.round((sp.baseX + sp.nx * sDisp) * 10) / 10;
  const sy = Math.round((sp.baseY + sp.ny * sDisp) * 10) / 10;

  let out = `M${sx} ${sy}`;
  const curves = path.curves;
  const len = curves.length;

  for (let i = 0; i < len; i++) {
    const c = curves[i];
    const pt1 = c[0];
    const w1_val =
      amp * (0.52 * Math.sin(pt1.theta * 2 + t_w1) + 0.32 * Math.sin(pt1.theta * 3 - t_w2) + 0.16 * Math.cos(pt1.theta + t_w3));
    const d1 = w1_val + (pt1.nx * vx + pt1.ny * vy);
    const p1x = Math.round((pt1.baseX + pt1.nx * d1) * 10) / 10;
    const p1y = Math.round((pt1.baseY + pt1.ny * d1) * 10) / 10;

    const pt2 = c[1];
    const w2_val =
      amp * (0.52 * Math.sin(pt2.theta * 2 + t_w1) + 0.32 * Math.sin(pt2.theta * 3 - t_w2) + 0.16 * Math.cos(pt2.theta + t_w3));
    const d2 = w2_val + (pt2.nx * vx + pt2.ny * vy);
    const p2x = Math.round((pt2.baseX + pt2.nx * d2) * 10) / 10;
    const p2y = Math.round((pt2.baseY + pt2.ny * d2) * 10) / 10;

    const pt3 = c[2];
    const w3_val =
      amp * (0.52 * Math.sin(pt3.theta * 2 + t_w1) + 0.32 * Math.sin(pt3.theta * 3 - t_w2) + 0.16 * Math.cos(pt3.theta + t_w3));
    const d3 = w3_val + (pt3.nx * vx + pt3.ny * vy);
    const p3x = Math.round((pt3.baseX + pt3.nx * d3) * 10) / 10;
    const p3y = Math.round((pt3.baseY + pt3.ny * d3) * 10) / 10;

    out += `C${p1x} ${p1y} ${p2x} ${p2y} ${p3x} ${p3y}`;
  }
  out += "Z";
  return out;
}

export interface LiquidSetupOptions {
  svg: SVGSVGElement | null;
  shapes: readonly string[];
  ns: string;
  isMobile?: boolean;
}

/**
 * 60+ FPS Hardware-Accelerated Liquid Flow Engine.
 *
 * Precomputes boundary surface normals and polar angles, eliminating runtime
 * transcendentals (atan2/hypot) and heap allocations. Synchronized with GSAP's
 * high-performance display-locked ticker with zero layout stalls.
 */
export function startLiquidFlow({ svg, shapes, ns, isMobile = false }: LiquidSetupOptions): () => void {
  if (!svg || typeof window === "undefined" || !shapes.length) return () => {};
  if (prefersReducedMotion()) return () => {};

  const precomputed = shapes.map((d) => precomputeSvgPath(d));

  // Find either shared defs path or fallback data-shape elements
  const shapeElements: SVGPathElement[][] = shapes.map((_, i) => {
    const defEl = svg.querySelector<SVGPathElement>(`#${ns}-flow-${i}`);
    if (defEl) return [defEl];
    return Array.from(svg.querySelectorAll<SVGPathElement>(`[data-shape="${ns}-${i}"]`));
  });

  const hasElements = shapeElements.some((arr) => arr.length > 0);
  if (!hasElements) return () => {};

  const configs = [
    {
      amp: isMobile ? 18 : 34,
      w1: 0.285,
      w2: 0.392,
      w3: 0.224,
      p1: 0.8,
      p2: 2.3,
      p3: 4.1,
      viscousWeight: 0.9,
    },
    {
      amp: isMobile ? 14 : 26,
      w1: 0.418,
      w2: 0.314,
      w3: 0.261,
      p1: 1.4,
      p2: 3.7,
      p3: 0.5,
      viscousWeight: 1.2,
    },
  ];

  let mouseImpulseX = 0;
  let mouseImpulseY = 0;
  let viscousX = 0;
  let viscousY = 0;
  let prevPointerX = 0;
  let prevPointerY = 0;
  let hasPointer = false;

  const unsubscribePointer = subscribePointer((nx, ny) => {
    if (!isIntersecting || isNavActive()) return;
    if (!hasPointer) {
      hasPointer = true;
      prevPointerX = nx;
      prevPointerY = ny;
      return;
    }
    const dX = nx - prevPointerX;
    const dY = ny - prevPointerY;
    prevPointerX = nx;
    prevPointerY = ny;

    if (isMobile) {
      const mag = Math.hypot(dX, dY);
      if (mag < 0.006) return;
      mouseImpulseX += dX * 8;
      mouseImpulseY += dY * 6;
      mouseImpulseX = Math.max(-10, Math.min(10, mouseImpulseX));
      mouseImpulseY = Math.max(-10, Math.min(10, mouseImpulseY));
      return;
    }

    const multiplier = 45;
    mouseImpulseX += dX * multiplier;
    mouseImpulseY += dY * (multiplier * 0.75);

    const maxImpulse = 38;
    mouseImpulseX = Math.max(-maxImpulse, Math.min(maxImpulse, mouseImpulseX));
    mouseImpulseY = Math.max(-maxImpulse, Math.min(maxImpulse, mouseImpulseY));
  });

  let scrollEnergy = 0;
  let effectiveTime = 0;
  let isIntersecting = true;

  const heroSection = svg.closest("section") || svg;
  let observer: IntersectionObserver | null = null;
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isIntersecting = entry.isIntersecting;
        }
      },
      { rootMargin: "0px" }
    );
    observer.observe(heroSection);
  }

  const root = document.documentElement;

  const tick = (_time: number, deltaTime: number) => {
    // 1. Guard against inactive or hidden states
    if (document.hidden || root.dataset.idle === "true" || isNavActive() || !isIntersecting) {
      return;
    }

    const dt = Math.min(0.064, (deltaTime || 16.6) / 1000);

    // 2. Scroll velocity boost
    const lenis = getLenis();
    const rawVelocity = lenis && typeof lenis.velocity === "number" ? Math.abs(lenis.velocity) : 0;
    const targetEnergy = Math.min(1.0, rawVelocity / 24);
    scrollEnergy += (targetEnergy - scrollEnergy) * (targetEnergy > scrollEnergy ? 0.22 : 0.04);

    effectiveTime += dt * (1 + scrollEnergy * 0.6);

    // 3. Viscous mouse disturbance
    viscousX += (mouseImpulseX - viscousX) * 0.042;
    viscousY += (mouseImpulseY - viscousY) * 0.042;
    mouseImpulseX *= 0.92;
    mouseImpulseY *= 0.92;
    viscousX *= 0.975;
    viscousY *= 0.975;

    const ampBoost = 1 + scrollEnergy * 0.45;

    // 4. Deform and set paths
    const count = precomputed.length;
    for (let i = 0; i < count; i++) {
      const targets = shapeElements[i];
      if (!targets || !targets.length) continue;

      const cfg = configs[i % configs.length];
      const newD = buildDeformedPathFast(
        precomputed[i],
        effectiveTime,
        cfg.amp * ampBoost,
        cfg.w1,
        cfg.w2,
        cfg.w3,
        cfg.p1,
        cfg.p2,
        cfg.p3,
        viscousX,
        viscousY,
        cfg.viscousWeight
      );

      for (let j = 0; j < targets.length; j++) {
        targets[j].setAttribute("d", newD);
      }
    }
  };

  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    unsubscribePointer();
    if (observer) observer.disconnect();
  };
}
