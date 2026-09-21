/**
 * The page's weather.
 *
 * One fixed layer behind everything, not a shape per section — which is what
 * the last attempt got wrong. A per-section layer has to be clipped to its
 * section, and clipping a soft gradient produces exactly the hard grey edge it
 * was supposed to avoid. Fixed and full-viewport, there is no box to be cut by.
 *
 * `screen` means one layer works over both fields: it lifts the ink and all
 * but vanishes on the bone, so the same drift reads on a black screen and a
 * cream one without ever being tinted wrong.
 *
 * Two still gradients, painted once; nothing repaints or ticks in JS (see
 * globals.css for why they no longer move).
 */
export default function Drift() {
  return (
    <div className="drift" aria-hidden="true">
      <span className="drift-a" />
      <span className="drift-b" />
    </div>
  );
}
