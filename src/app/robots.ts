import type { MetadataRoute } from "next";
import { SITE, absolute, indexable } from "@/lib/seo";

/**
 * /robots.txt. The production deploy is open to every crawler but for the
 * dashboard and the API, and points them at the sitemap; a preview deploy
 * (another address for a copy of the site) turns them all away, so it never
 * competes with boo26.live in search.
 */
export default function robots(): MetadataRoute.Robots {
  if (!indexable()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: absolute("/sitemap.xml"),
    host: SITE.origin,
  };
}
