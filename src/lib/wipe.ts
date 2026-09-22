import { STORAGE } from "./storage";

/**
 * The page wipe's half that runs before React: the script at the top of
 * <body>, and the count it starts. PageWipe (src/components/fx/PageWipe.tsx)
 * is the other half.
 */

/** The preloader's count, as the script leaves it on window.__booCount. */
export type WipeCount = {
  /** the value on screen */
  p: number;
  /** count on to `to`, over about `ms`; resolves on the frame that shows it */
  go(to: number, ms: number): Promise<void>;
  stop(): void;
};

declare global {
  interface Window {
    __booCount?: WipeCount;
  }
}

/**
 * Runs before the first paint, and only when motion is welcome. It hides the
 * animated elements (data-js), covers the page for PageWipe to open
 * (data-wipe) — `arrive` if the last page just wiped over to this one (a
 * fresh flag only), `reload` if this visit has seen the preloader, else `load`
 * for the full count — and starts the count.
 *
 * The count is one integer, --p, which the number and the wordmark's fill
 * both read. It moves once per frame the browser actually draws, by a few
 * points at most (eight when frames are scarce), and lands a point at a time.
 * It used to run on the animation clock, which keeps time whether or not
 * anything is drawn: a phone busy starting the page would draw "00", miss
 * every frame in between, and next draw "100". Stepped per frame, a busy
 * stretch holds the number where it is, and it always visibly counts.
 *
 * On its own it creeps towards 64 on an ease-out. PageWipe steers it from
 * there once the page has hydrated.
 */
export const WIPE_BOOT = `(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var d = document.documentElement, m = "load";
  d.dataset.js = "true";
  try {
    var t = +sessionStorage.getItem(${JSON.stringify(STORAGE.wipe)});
    if (t && Date.now() - t < 10000) m = "arrive";
    else if (sessionStorage.getItem(${JSON.stringify(STORAGE.seen)})) m = "reload";
  } catch (e) {}
  d.dataset.wipe = m;

  var c = (window.__booCount = { p: 0 });
  var leg = { from: 0, to: 64, ms: 3400, t0: 0 };
  var el = null, raf = 0, last = 0, drawn = -1, done = null;
  function tick(now) {
    raf = 0;
    if (!d.dataset.wipe) return;
    el = el || document.querySelector(".preloader-inner");
    if (!leg.t0) leg.t0 = now;
    var x = Math.min(1, (now - leg.t0) / leg.ms);
    var aim = Math.round(leg.from + (leg.to - leg.from) * (1 - Math.pow(1 - x, 3)));
    var step = Math.min(8, Math.max(1, Math.round((now - (last || now)) * 0.18)), Math.ceil((leg.to - c.p) / 4));
    last = now;
    if (aim > c.p) c.p = Math.min(aim, c.p + Math.max(1, step));
    if (el && c.p !== drawn) el.style.setProperty("--p", (drawn = c.p));
    if (done && c.p >= leg.to) { done(); done = null; }
    if (!el || c.p < leg.to) raf = requestAnimationFrame(tick);
  }
  c.go = function (to, ms) {
    leg = { from: c.p, to: to, ms: ms, t0: 0 };
    last = 0;
    if (!raf) raf = requestAnimationFrame(tick);
    return new Promise(function (r) { done = r; });
  };
  c.stop = function () { cancelAnimationFrame(raf); raf = 0; done = null; };
  raf = requestAnimationFrame(tick);
})();`;
