import LegalPage from "@/components/legal/LegalPage";
import { TERMS } from "@/components/legal/terms";
import { adminOnly } from "@/lib/admin/preview";

export default async function PreviewTerms() {
  await adminOnly();
  return <LegalPage doc={TERMS} live />;
}
