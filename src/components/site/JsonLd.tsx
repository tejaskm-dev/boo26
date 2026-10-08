import { ldJson } from "@/lib/seo";

/**
 * Structured data for search engines: one script with everything in it, as
 * a graph. A plain script tag, not next/script — it's data, nothing runs.
 */
export default function JsonLd({ graph }: { graph: object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: ldJson({ "@context": "https://schema.org", "@graph": graph }) }}
    />
  );
}
