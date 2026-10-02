import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Sprite from "@/components/ui/Sprite";
import Wordmark from "@/components/ui/Wordmark";
import BlobButton from "@/components/ui/BlobButton";
import Words from "@/components/fx/Words";
import { siteLive } from "@/lib/live";

export const metadata: Metadata = {
  title: "shh.",
  robots: { index: false, follow: false },
};

/**
 * The teaser's hidden page. The console hints at it; nothing links to it.
 * It goes when the full site does.
 */
export default function ShhPage() {
  if (siteLive() && process.env.NODE_ENV === "production") notFound();

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-ink px-[var(--edge)] text-center text-bone" data-field="ink">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-[var(--edge)] py-[clamp(1rem,2.2vw,1.9rem)]">
        <Wordmark href="/" className="pointer-events-auto" />
      </header>

      <Sprite name="cat-oneeye" scale={1.1} idle={4} className="mb-[clamp(1.5rem,4vh,2.5rem)]" />
      <Words as="h1" className="brush -rotate-[1.5deg] select-none text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.88] text-lime">
        {"you weren’t supposed\nto find this."}
      </Words>
      <p className="hand mt-[clamp(1.25rem,3vh,2rem)] -rotate-[2deg] text-[clamp(1.2rem,2vw,1.6rem)] text-bone/60">tell no one.</p>
      <div className="mt-[clamp(2rem,5vh,3rem)]">
        <BlobButton data-wipe-origin href="/" size="lg">
          Back
        </BlobButton>
      </div>
    </main>
  );
}
