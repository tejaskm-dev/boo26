import type { NextConfig } from "next";
import { parseLive } from "./src/lib/live";

/** true: the full site. false or unset: the coming-soon teaser (src/lib/live.ts). */
const live = parseLive(process.env.LIVE_STATUS);

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
  async redirects() {
    if (live) return [];
    return [
      { source: "/soon", destination: "/", permanent: false },
      { source: "/terms", destination: "/", permanent: false },
      { source: "/code-of-conduct", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
