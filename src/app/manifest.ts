import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { siteLive } from "@/lib/live";
import { SEO } from "@/lib/site";
import { SOON } from "@/lib/soon";
import { NAME } from "@/lib/seo";

/**
 * /manifest.webmanifest: the name and badge a phone uses when the site's
 * added to a home screen. Its description follows LIVE_STATUS like
 * everything else, so the teaser's says nothing it shouldn't.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: NAME,
    short_name: BRAND.name,
    description: siteLive() ? SEO.description : SOON.meta.description,
    start_url: "/",
    display: "browser",
    background_color: "#080808",
    theme_color: "#080808",
    icons: [
      { src: "/icon1.png", sizes: "48x48", type: "image/png" },
      { src: "/icon2.png", sizes: "96x96", type: "image/png" },
      { src: "/icon3.png", sizes: "192x192", type: "image/png" },
    ],
  };
}
