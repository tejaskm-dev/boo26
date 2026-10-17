import Sprite from "@/components/ui/Sprite";
import Wordmark from "@/components/ui/Wordmark";
import BlobButton from "@/components/ui/BlobButton";
import Words from "@/components/fx/Words";
import { SURVIVAL } from "@/lib/site";

/**
 * The full site's hidden page, the way /shh is the teaser's: the console
 * points here (Survival.tsx), nothing links to it. A door someone got
 * through, and no way out but the one you build.
 */
export default function NoExit() {
  const words = SURVIVAL.exit;
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-ink px-[var(--edge)] text-center text-bone" data-field="ink">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-[var(--edge)] py-[clamp(1rem,2.2vw,1.9rem)]">
        <Wordmark href="/" className="pointer-events-auto" />
      </header>

      <Sprite name="door-smashed" scale={0.62} idle={4} className="mb-[clamp(1.5rem,4vh,2.5rem)]" />
      <Words as="h1" className="brush -rotate-[1.5deg] select-none text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.88] text-lime">
        {words.heading}
      </Words>
      <p className="hand mt-[clamp(1.25rem,3vh,2rem)] -rotate-[2deg] text-[clamp(1.2rem,2vw,1.6rem)] text-bone/60">{words.note}</p>
      <p className="label mt-3 text-bone/40">{words.after}</p>
      <div className="mt-[clamp(2rem,5vh,3rem)]">
        <BlobButton data-wipe-origin href="/" size="lg">
          {words.back}
        </BlobButton>
      </div>
    </main>
  );
}
