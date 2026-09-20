"use client";

import Wordmark from "@/components/ui/Wordmark";
import BlobButton from "@/components/ui/BlobButton";
import MenuTrigger from "@/components/ui/MenuTrigger";
import { EVENT } from "@/lib/site";

export default function Header({
  onOpenMenu,
  menuOpen,
}: {
  onOpenMenu: () => void;
  menuOpen: boolean;
}) {
  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-[var(--edge)] py-[clamp(1rem,2.2vw,1.9rem)]"
      style={{ color: "var(--head-fg)" }}
    >
      <Wordmark className="pointer-events-auto" />

      <div className="pointer-events-auto flex items-center gap-[clamp(0.75rem,1.6vw,1.75rem)]">
        <span className="hidden md:block">
          <BlobButton href={EVENT.registerHref}>Register</BlobButton>
        </span>
        <MenuTrigger onClick={onOpenMenu} expanded={menuOpen} />
      </div>
    </header>
  );
}
