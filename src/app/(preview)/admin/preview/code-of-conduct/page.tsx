import LegalPage from "@/components/legal/LegalPage";
import { CONDUCT } from "@/components/legal/conduct";
import { adminOnly } from "@/lib/admin/preview";

export default async function PreviewConduct() {
  await adminOnly();
  return <LegalPage doc={CONDUCT} live />;
}
