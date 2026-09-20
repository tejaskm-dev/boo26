/**
 * The slow weather behind a section.
 *
 * Three oversized blobs in the field's own ink, barely separated from it,
 * drifting and re-shaping on long mismatched periods. Nothing here reads as a
 * shape — it reads as the field not being flat. Pure CSS so it costs a
 * compositor layer and no JS ticking, and it stops entirely under
 * prefers-reduced-motion.
 */
const PRESETS = [
  { drift: "drift-a", time: 58, morph: 24, d: 0, m: 0 },
  { drift: "drift-b", time: 71, morph: 31, d: -9, m: -7 },
  { drift: "drift-c", time: 64, morph: 27, d: -21, m: -14 },
] as const;

type Blob = { x: string; y: string; w: string; h?: string };

export default function Ambient({
  tone,
  blobs,
  className = "",
}: {
  tone: "ink" | "bone";
  blobs: Blob[];
  className?: string;
}) {
  // just off the field colour — visible as depth, never as an object
  const fill =
    tone === "ink" ? "rgba(243,240,231,0.055)" : "rgba(8,8,8,0.05)";

  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`} aria-hidden="true">
      {blobs.map((b, i) => {
        const p = PRESETS[i % PRESETS.length];
        return (
          <span
            key={i}
            className="ambient-blob"
            style={
              {
                left: b.x,
                top: b.y,
                width: b.w,
                height: b.h ?? b.w,
                background: fill,
                "--drift": p.drift,
                "--drift-time": `${p.time}s`,
                "--drift-delay": `${p.d}s`,
                "--morph-time": `${p.morph}s`,
                "--morph-delay": `${p.m}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
