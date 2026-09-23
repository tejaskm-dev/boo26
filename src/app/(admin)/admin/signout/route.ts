import { redirect } from "next/navigation";
import { endSession } from "@/lib/admin/session";

export async function POST() {
  await endSession();
  redirect("/admin");
}
