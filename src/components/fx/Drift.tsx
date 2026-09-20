/**
 * The page's weather.
 *
 * One fixed layer behind everything, not a shape per section — which is what
 * the last attempt got wrong. A per-section layer has to be clipped to its
 * section, and clipping a soft gradient produces exactly the hard grey edge it
 * was supposed to avoid. Fixed and full-viewport, there is no box to be cut by.
 *
 * `overlay` means one layer works over both fields: it lightens the ink and
 * darkens the bone, so the same drift reads on a black screen and a cream one
 * without ever being tinted wrong.
 *
 * Two children on long mismatched periods, transform only, so the whole thing
 * is a pair of composited layers the GPU moves and nothing repaints or ticks
 * in JS. It stops completely under prefers-reduced-motion.
 */
export default function Drift() {
  return (
    <div className="drift" aria-hidden="true">
      <span className="drift-a" />
      <span className="drift-b" />
    </div>
  );
}
