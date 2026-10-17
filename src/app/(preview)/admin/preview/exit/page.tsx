import NoExit from "@/components/site/NoExit";
import { adminOnly } from "@/lib/admin/preview";

export default async function PreviewExit() {
  await adminOnly();
  return <NoExit />;
}
