/**
 * The teaser starts from the top, every time it's loaded again.
 *
 * It's a show, not a document: the loader, the way in, the cards that hold
 * you on the way down — all of it runs from the top. Put back where it was
 * (the browser does that for a reload, or for an address with a section in
 * it), it opened halfway down: in the middle of the show, with everything
 * above it unplayed, measured under the cover against a page still growing
 * — and so, as often as not, further down than it had been.
 *
 * So the browser never puts the teaser back (history.scrollRestoration),
 * and a reload — or a step back to a copy the browser didn't keep — starts
 * at the top, with the address clean. A first visit to an address with a
 * section in it (someone's link) still lands there (PageWipe's landOnHash);
 * the teaser's own links never write one (Anchors.tsx). A page the browser
 * did keep comes back exactly as it was left, and none of this runs.
 *
 * Inline, where the page starts: before any of it is drawn, measured, or
 * put back.
 */
export const FROM_THE_TOP = `(function () {
  try {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    var nav = performance.getEntriesByType ? performance.getEntriesByType("navigation")[0] : null;
    var old = performance.navigation ? performance.navigation.type : 0;
    var type = nav ? nav.type : old === 1 ? "reload" : old === 2 ? "back_forward" : "navigate";
    if (type !== "reload" && type !== "back_forward") return;
    if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
    scrollTo(0, 0);
  } catch (e) {}
})();`;
