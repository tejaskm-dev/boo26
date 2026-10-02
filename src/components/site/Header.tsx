"use client";

import Wordmark from "@/components/ui/Wordmark";
import BlobButton from "@/components/ui/BlobButton";
import MenuTrigger from "@/components/ui/MenuTrigger";

export default function Header({
  onOpenMenu,
  menuOpen,
  cta,
}: {
  onOpenMenu: () => void;
  menuOpen: boolean;
  cta: { label: string; href: string };
}) {
  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-[var(--edge)] py-[clamp(1rem,2.2vw,1.9rem)]"
      style={{ color: "var(--head-fg)" }}
    >
      <Wordmark className="pointer-events-auto" />

      <div className="pointer-events-auto flex items-center gap-[clamp(0.75rem,1.6vw,1.75rem)]">
        <span className="hidden md:block">
          <BlobButton href={cta.href}>{cta.label}</BlobButton>
        </span>
        <MenuTrigger onClick={onOpenMenu} expanded={menuOpen} />
      </div>
    </header>
  );
}
