/**
 * A blob of ink on the cream — the dark the After Dark eyes sit in — with
 * the lime hairline every field carries riding just off its edge, and a
 * soft shadow under it.
 *
 * Drawn with room round it in its own box, so it can move without touching
 * the edge of that box: marked `data-edge`, it's one of the shapes the full
 * site keeps gently moving (LivingEdges.tsx), and the shadow and the hairline
 * are bent with it, by the same function of where each point sits, so
 * neither ever peeks out from behind it.
 */
const VIEW = "-60 -60 520 460";
const D = "M206 6C300 2 386 58 393 152C400 246 336 326 222 333C108 340 14 286 7 184C0 82 112 10 206 6Z";

export default function InkBlob({ className = "", id }: { className?: string; /** unique per blob on the page: it names the shadow's blur */ id: string }) {
  return (
    <span aria-hidden="true" data-edge={VIEW} className={`pointer-events-none absolute block ${className}`}>
      <svg viewBox={VIEW} className="h-full w-full overflow-visible">
        <defs>
          <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={12} />
          </filter>
        </defs>
        <path d={D} fill="rgba(8, 8, 8, 0.26)" transform="translate(0 18)" filter={`url(#${id}-shadow)`} />
        <path d={D} fill="none" stroke="var(--color-lime)" strokeWidth={1.8} vectorEffect="non-scaling-stroke" opacity={0.85} transform="translate(-18 12)" />
        <path d={D} fill="var(--color-ink)" />
      </svg>
    </span>
  );
}
