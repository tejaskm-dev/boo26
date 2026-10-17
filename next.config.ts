import type { NextConfig } from "next";
import { parseLive } from "./src/lib/live";
import { parseRegisterUrl, redirectTarget } from "./src/lib/register/external";

/** true: the full site. false or unset: the coming-soon teaser (src/lib/live.ts). */
const live = parseLive(process.env.LIVE_STATUS);
/** the outside page people register on, or null (src/lib/register/external.ts) */
const register = parseRegisterUrl(process.env.REGISTER_URL);

const nextConfig: NextConfig = {
  devIndicators: false,
  // `next dev` only: a phone on the same Wi-Fi, opening the laptop's address
  // (to scan a team's QR, say), gets a working page instead of one whose
  // scripts the dev server refuses to serve.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  images: {
    formats: ["image/webp"],
  },

  // The teaser is a page of its own (src/app/(site)/soon), so the two home
  // pages never share a bundle: each loads only its own sections. While the
  // site isn't live, "/" serves the teaser. A rewrite rather than a redirect,
  // so the address stays "/", and it's resolved by the router before any page
  // runs — the teaser is still static HTML straight off the CDN.
  async rewrites() {
    if (live) return [];
    return { beforeFiles: [{ source: "/", destination: "/soon" }], afterFiles: [], fallback: [] };
  },

  // Nobody needs the teaser at a second address, and the terms and the code
  // of conduct describe the night itself — its date, what happens in it — so
  // they wait for it. Temporary, because they come back with LIVE_STATUS.
  //
  // Once the full site is up, /register and anything under it go to the
  // outside page registration runs on. Temporary too: the page can change.
  // Until then — and always, while the teaser is up — there's nothing under
  // /register worth a visit: the site's own sign-up is off
  // (src/lib/register/mode.ts), so its pages go to the one that says so. Sent
  // on here, before they're rendered, because a page that only shows "not
  // open" still lists the sign-up's scripts, and those name the date.
  async redirects() {
    const signup = live && register
      ? [{ source: "/register/:path*", destination: redirectTarget(register), permanent: false }]
      : [{ source: "/register/:path+", destination: "/register", permanent: false }];
    if (live) return signup;
    return [
      ...signup,
      { source: "/soon", destination: "/", permanent: false },
      { source: "/terms", destination: "/", permanent: false },
      { source: "/code-of-conduct", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
