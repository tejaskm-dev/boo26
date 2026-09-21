import type { Metadata } from "next";
import ComingSoon from "@/components/sections/ComingSoon";
import { EVENT } from "@/lib/site";

export const metadata: Metadata = {
  title: `Registration coming soon — ${EVENT.name} ${EVENT.year}`,
  description: `Registration for ${EVENT.name} ${EVENT.year} isn't open yet. ${EVENT.dateLong}, ASIET Kalady.`,
};

export default function RegisterPage() {
  return (
    <main className="relative overflow-x-clip">
      <ComingSoon />
    </main>
  );
}
