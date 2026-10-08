import type { MetadataRoute } from "next";
import { siteLive } from "@/lib/live";
import { registrationOpen } from "@/lib/register/mode";
import { absolute } from "@/lib/seo";

/**
 * /sitemap.xml: the pages worth finding, on whichever side of LIVE_STATUS
 * this build is. The teaser has its one page and the privacy policy; the
 * full site adds the terms and the code of conduct, and — once registration
 * opens — the sign-up and what to read before it. Built with the pages, so
 * the full site's "last changed" is the deploy. The teaser's says nothing:
 * no date anywhere, not even that one.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const live = siteLive();
  const lastModified = live ? new Date() : undefined;
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly") => ({
    url: absolute(path),
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
  });
  if (!live) return [page("/", 1, "weekly"), page("/privacy", 0.3, "yearly")];
  return [
    page("/", 1, "weekly"),
    ...(registrationOpen()
      ? [page("/register", 0.9, "weekly"), page("/register/rules", 0.6, "monthly"), page("/register/judging", 0.6, "monthly")]
      : []),
    page("/code-of-conduct", 0.4, "yearly"),
    page("/terms", 0.3, "yearly"),
    page("/privacy", 0.3, "yearly"),
  ];
}
