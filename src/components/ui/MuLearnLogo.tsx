"use client";

type Props = {
  className?: string;
  href?: string;
};

/**
 * µLearn ASIET logo for the navbar — adaptive to the underlying field tone
 * (ink on bone, bone on ink) through `var(--head-fg-right)`.
 */
export default function MuLearnLogo({ className = "", href }: Props) {
  const content = (
    <span
      role="img"
      aria-label="µLearn ASIET"
      className="block h-[clamp(1.35rem,2vw,1.85rem)] aspect-[1945/524] bg-current transition-colors duration-300"
      style={{
        mask: 'url("/assets/mulearn-logo.svg") center / contain no-repeat',
        WebkitMask: 'url("/assets/mulearn-logo.svg") center / contain no-repeat',
      }}
    />
  );

  if (href) {
    return (
      <a
        href={href}
        aria-label="µLearn ASIET"
        className={`group inline-flex items-center text-[var(--head-fg-right)] outline-none transition-colors duration-300 hover:text-lime focus-visible:text-lime ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <span
      className={`inline-flex items-center text-[var(--head-fg-right)] transition-colors duration-300 hover:text-lime ${className}`}
    >
      {content}
    </span>
  );
}
