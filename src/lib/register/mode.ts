/**
 * Whether the site's own sign-up (/register: the fork, starting and joining a
 * team) takes anyone. It doesn't: registration runs on an outside page, and
 * /register redirects there once REGISTER_URL is set (src/lib/register/external.ts).
 * Until then every /register path is the "isn't open yet" page.
 *
 * The flow itself is still here, whole — its pages, its checks, the store the
 * dashboard reads — in case a later edition registers on the site again. To
 * bring it back, make this return true while the full site is live and drop
 * the redirect that sends /register's sub-pages to /register (next.config.ts).
 * The server actions and the ID check ask this too, so nothing can be sent to
 * a closed flow by calling them directly.
 */
export function registrationOpen(): boolean {
  return false;
}
