import LegalPage from "@/components/legal/LegalPage";
import { privacy } from "@/components/legal/privacy";
import { adminOnly } from "@/lib/admin/preview";

export default async function PreviewPrivacy() {
  await adminOnly();
  return <LegalPage doc={privacy(true)} live />;
}
