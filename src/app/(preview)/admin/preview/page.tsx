import LiveHome from "@/components/site/LiveHome";
import { adminOnly } from "@/lib/admin/preview";

/** The full site's home page, as "/" will be once LIVE_STATUS is on. */
export default async function PreviewHome() {
  await adminOnly();
  return <LiveHome preview />;
}
