import Image from "next/image";
import { EVENT } from "@/lib/site";

/**
 * The supplied drippy BOO! wordmark plus the year. Both tones are rendered and
 * crossfaded so the mark can sit over either field without a flash.
 */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <a
      href="#top"
      aria-label={`${EVENT.name} ${EVENT.year} — top of page`}
      className={`group relative inline-flex flex-col items-start gap-0.5 outline-none md:flex-row md:items-baseline md:gap-[0.5em] ${className}`}
    >
      <span
        className="relative block w-[clamp(5rem,6.4vw,6.75rem)] transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:-rotate-2"
        style={{ aspectRatio: "1475 / 657" }}
      >
        <Image
          src="/assets/wordmark.webp"
          alt={`${EVENT.name} ${EVENT.year}`}
          fill
          sizes="120px"
          priority
          className="object-contain opacity-[var(--mark-ink,1)] transition-opacity duration-500"
        />
        <Image
          src="/assets/wordmark-light.webp"
          alt=""
          aria-hidden="true"
          fill
          sizes="120px"
          priority
          className="object-contain opacity-[var(--mark-bone,0)] transition-opacity duration-500"
        />
      </span>
      <span
        className="display text-lime leading-none text-[clamp(1.35rem,5vw,1.6rem)] md:text-[clamp(1.15rem,1.7vw,1.6rem)]"
      >
        {EVENT.year}
      </span>
    </a>
  );
}
