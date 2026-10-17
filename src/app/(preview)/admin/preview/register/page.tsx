import ComingSoon from "@/components/sections/ComingSoon";
import { adminOnly } from "@/lib/admin/preview";

/**
 * What /register shows on the full site while REGISTER_URL isn't set. Once
 * it is, the preview's Register buttons open the outside page instead
 * (PreviewBar.tsx), the way the live site redirects to it.
 */
export default async function PreviewRegister() {
  await adminOnly();
  return (
    <main className="relative overflow-x-clip">
      <ComingSoon />
    </main>
  );
}
