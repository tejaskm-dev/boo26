/**
 * Where registration stands, and so what every page under /register shows.
 *
 *   soon     the coming-soon page, as before. The default for a production
 *            build, so merging this can't open registration by accident.
 *   preview  the whole flow, working end to end against a store kept in the
 *            server's memory (src/lib/register/store.ts). Good for trying it —
 *            teams vanish when the server restarts, and aren't shared between
 *            servers. The default under `next dev`.
 *
 * Set BOO_REGISTRATION=preview where a production build is made to show the
 * preview there. Registration opens for real once a database is wired into
 * the store; the pages and the flow don't change.
 */
export type RegistrationMode = "soon" | "preview";

export function registrationMode(): RegistrationMode {
  const set = process.env.BOO_REGISTRATION;
  if (set === "soon" || set === "preview") return set;
  return process.env.NODE_ENV === "development" ? "preview" : "soon";
}
