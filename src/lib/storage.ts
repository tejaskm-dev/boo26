/**
 * Everything the site keeps in the browser. It is all session storage — gone
 * when the tab closes — and the privacy page lists it from here, so the
 * policy can't drift from what the code actually stores.
 */
export const STORAGE = {
  /** left by a page as it wipes over to the next, which reads it on arrival */
  wipe: "boo:wipe",
  /** this visit has seen the full count, so later pages get the short one */
  seen: "boo:seen",
  /** iPhone and iPad only: motion access was granted this visit */
  tilt: "boo-tilt-granted",
} as const;
