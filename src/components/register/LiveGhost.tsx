"use client";

import { useEffect, useImperativeHandle, useRef } from "react";
import { gsap } from "gsap";
import { GHOST_BODY } from "@/components/ui/Glyphs";
import { subscribePointer } from "@/lib/pointer";
import { prefersReducedMotion } from "@/lib/motion";

export type GhostHandle = {
  /** the layer a caller moves for a hop: arcs, squash and stretch, from its feet */
  readonly body: HTMLSpanElement | null;
  /** hold its gaze somewhere, -1..1 each way; NaN lets it go back to following */
  look(x: number, y: number): void;
  nod(): void;
  scare(): void;
  cheer(): void;
  fly(): void;
};

/**
 * The site's little ghost, alive: it floats, blinks when it feels like it
 * (now and then twice), follows the pointer with its eyes — or the phone's
 * tilt — and can be put in a mood. Bone with ink eyes, for the ink field.
 *
 * Nested so nothing fights: the float drifts the whole ghost, the body is
 * left for whoever moves it (hops land on its feet), and the face turns and
 * nods on its own. With reduced motion it just sits there, looking.
 */
export default function LiveGhost({
  ref,
  className = "",
  follow = true,
  search = false,
}: {
  ref?: React.Ref<GhostHandle>;
  className?: string;
  /** the eyes follow the pointer */
  follow?: boolean;
  /** glances one way and the other on its own, as if waiting for someone */
  search?: boolean;
}) {
  const float = useRef<HTMLSpanElement>(null);
  const body = useRef<HTMLSpanElement>(null);
  const face = useRef<SVGSVGElement>(null);
  const gaze = useRef<SVGGElement>(null);
  const lids = useRef<SVGGElement>(null);
  const mouth = useRef<SVGEllipseElement>(null);
  const smile = useRef<SVGPathElement>(null);
  const eyes = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);
  /** a mood is playing; nods wait for it */
  const busy = useRef(false);
  /** look() has the eyes, so the pointer doesn't */
  const held = useRef(false);
  const lastNod = useRef(0);

  useEffect(() => {
    const f = float.current;
    const g = gaze.current;
    const l = lids.current;
    if (!f || !g || !l || prefersReducedMotion()) return;

    const drift = gsap.to(f, { y: -3.5, rotation: 3, duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: -1 });

    // at its own pace, and every so often twice
    let next: gsap.core.Tween | undefined;
    const blink = () => {
      const shut = (at: number) =>
        gsap
          .timeline({ delay: at })
          .to(l, { scaleY: 0.08, duration: 0.06, ease: "power2.in", transformOrigin: "50% 50%" })
          .to(l, { scaleY: 1, duration: 0.13, ease: "power2.out" });
      shut(0);
      if (Math.random() < 0.25) shut(0.26);
      next = gsap.delayedCall(gsap.utils.random(2.2, 5.4), blink);
    };
    next = gsap.delayedCall(gsap.utils.random(0.8, 2.6), blink);

    const x = gsap.quickTo(g, "x", { duration: 0.45, ease: "power3.out" });
    const y = gsap.quickTo(g, "y", { duration: 0.45, ease: "power3.out" });
    eyes.current = { x, y };
    const unfollow = follow
      ? subscribePointer((nx, ny) => {
          if (held.current) return;
          x(nx * 3.2);
          y(ny * 2.2);
        })
      : () => {};

    // waiting for someone: a glance one way, the other, back
    const scan = search
      ? gsap
          .timeline({ repeat: -1, repeatDelay: 0.7 })
          .to(g, { x: -3.4, duration: 0.35, ease: "power2.inOut", delay: 0.9 })
          .to(g, { x: 3.4, duration: 0.55, ease: "power2.inOut", delay: 1 })
          .to(g, { x: 0, duration: 0.35, ease: "power2.inOut", delay: 1 })
      : null;

    return () => {
      drift.kill();
      next?.kill();
      scan?.kill();
      unfollow();
      eyes.current = null;
      gsap.killTweensOf([f, g, l]);
      gsap.set([f, g, l], { clearProps: "transform" });
    };
  }, [follow, search]);

  useImperativeHandle(
    ref,
    () => ({
      get body() {
        return body.current;
      },

      look(x, y) {
        const e = eyes.current;
        if (!e) return;
        if (Number.isNaN(x)) {
          held.current = false;
          e.x(0);
          e.y(0);
          return;
        }
        held.current = true;
        e.x(x * 3.2);
        e.y(y * 2.2);
      },

      nod() {
        const s = face.current;
        const now = performance.now();
        if (!s || busy.current || now - lastNod.current < 140 || prefersReducedMotion()) return;
        lastNod.current = now;
        gsap.fromTo(s, { y: 0 }, { y: 1.8, duration: 0.07, ease: "power1.out", yoyo: true, repeat: 1 });
      },

      scare() {
        const b = body.current;
        const l = lids.current;
        const m = mouth.current;
        if (!b || !l || !m || prefersReducedMotion()) return;
        busy.current = true;
        gsap
          .timeline({ onComplete: () => void (busy.current = false) })
          .to(l, { scale: 1.32, duration: 0.14, ease: "back.out(3)", transformOrigin: "50% 50%" }, 0)
          .fromTo(m, { scale: 0.2, opacity: 1, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.22, ease: "back.out(3)" }, 0)
          .fromTo(b, { x: -1.7 }, { x: 1.7, duration: 0.045, repeat: 11, yoyo: true, ease: "none" }, 0)
          .to(b, { x: 0, duration: 0.05 })
          .to(b, { opacity: 0.55, duration: 0.08, yoyo: true, repeat: 3 }, 0)
          .to(l, { scale: 1, duration: 0.3, ease: "power2.out" }, 0.95)
          .to(m, { scale: 0.2, opacity: 0, duration: 0.2 }, 0.95);
      },

      cheer() {
        const b = body.current;
        const s = face.current;
        const l = lids.current;
        const grin = smile.current;
        if (!b || !s || !l || !grin || prefersReducedMotion()) return;
        busy.current = true;
        gsap
          .timeline({ onComplete: () => void (busy.current = false) })
          // eyes squeezed happy, and a grin
          .to(l, { scaleY: 0.32, duration: 0.14, transformOrigin: "50% 65%" }, 0)
          .to(grin, { opacity: 1, duration: 0.14 }, 0)
          // up, a full turn in the air, down with a squash
          .to(b, { y: -13, scaleY: 1.12, scaleX: 0.9, duration: 0.24, ease: "power2.out", transformOrigin: "50% 100%" }, 0)
          .to(s, { rotation: 360, duration: 0.52, ease: "power2.inOut", transformOrigin: "50% 55%" }, 0.04)
          .to(b, { y: 0, duration: 0.22, ease: "power2.in" }, 0.26)
          .to(b, { scaleY: 0.8, scaleX: 1.16, duration: 0.07, ease: "power2.out" })
          .to(b, { scaleY: 1, scaleX: 1, duration: 0.6, ease: "elastic.out(1, 0.33)" })
          .set(s, { rotation: 0 })
          .to(l, { scaleY: 1, duration: 0.2 }, "-=0.2")
          .to(grin, { opacity: 0, duration: 0.2 }, "<");
      },

      fly() {
        const b = body.current;
        if (!b || prefersReducedMotion()) return;
        busy.current = true;
        gsap.to(b, { y: -48, scale: 0.7, opacity: 0, duration: 0.75, ease: "power2.in", transformOrigin: "50% 50%" });
      },
    }),
    [],
  );

  return (
    <span ref={float} className={`block ${className}`}>
      <span ref={body} className="block">
        <svg ref={face} viewBox="0 0 64 60" className="block h-auto w-full overflow-visible" aria-hidden="true">
          <path d={GHOST_BODY} fill="var(--color-bone)" />
          <g ref={gaze}>
            <g ref={lids}>
              <ellipse cx="24" cy="26" rx="4" ry="5.4" fill="var(--color-ink)" />
              <ellipse cx="40" cy="26" rx="4" ry="5.4" fill="var(--color-ink)" />
            </g>
          </g>
          {/* only in a mood: the "o" of a fright, the grin of a good hop */}
          <ellipse ref={mouth} cx="32" cy="39.5" rx="3.2" ry="4.2" fill="var(--color-ink)" opacity={0} />
          <path
            ref={smile}
            d="M25.5 37.5c2.2 3.4 10.8 3.4 13 0"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth={2.6}
            strokeLinecap="round"
            opacity={0}
          />
        </svg>
      </span>
    </span>
  );
}
