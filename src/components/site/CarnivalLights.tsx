import Sprite from "@/components/ui/Sprite";

/**
 * A string of bulbs over the midnight carnival's table: a wire sagging from
 * one side to the other, and the bulbs hanging off it. They come on one at a
 * time, with a flicker, as the scene comes into view — the section's
 * [data-awake] (Awake.tsx) — and every so often one of them stutters. Off
 * screen they're just lit; with motion turned down, lit and still (fx.css).
 *
 * Where each hangs is worked out here, once: along the wire's own curve.
 */
const WIRE = { view: "0 0 1000 140", from: 18, sag: 108 };

export default function CarnivalLights({ bulbs = 7, className = "" }: { bulbs?: number; className?: string }) {
  const at = Array.from({ length: bulbs }, (_, i) => {
    const t = 0.07 + (0.86 * i) / Math.max(1, bulbs - 1);
    // the wire is a quadratic from (0, from) through a sag to (1000, from)
    const y = WIRE.from + 2 * t * (1 - t) * WIRE.sag;
    return { left: `${t * 100}%`, top: `${(y / 140) * 100}%`, tilt: (t - 0.5) * -14 };
  });
  return (
    <div aria-hidden="true" className={`fx-bulbs pointer-events-none absolute ${className}`}>
      <svg viewBox={WIRE.view} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        <path
          d={`M0 ${WIRE.from}Q500 ${WIRE.from + WIRE.sag * 2} 1000 ${WIRE.from}`}
          fill="none"
          stroke="rgba(243, 240, 231, 0.35)"
          strokeWidth={1.4}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {at.map((b, i) => (
        <span
          key={i}
          className="fx-bulb"
          style={{ left: b.left, top: b.top, rotate: `${b.tilt}deg`, "--i": i, "--s": `${5.5 + ((i * 37) % 5) * 1.3}s` } as React.CSSProperties}
        >
          <Sprite name="bulb-off" scale={0.34} className="w-full" />
          <span className="fx-bulb-on soon-loop">
            <Sprite name="bulb-on" scale={0.34} className="w-full" />
          </span>
        </span>
      ))}
    </div>
  );
}
