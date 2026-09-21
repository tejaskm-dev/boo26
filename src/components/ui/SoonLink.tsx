"use client";

import { comingSoon } from "@/lib/toast";

/**
 * A link to something that isn't live yet.
 *
 * With an href it is an ordinary link. Without one it is a button that says
 * "coming soon" in place, so no placeholder URL ever ships. When a destination
 * goes live, its href goes into site.ts and nothing here changes.
 *
 * `cursor-pointer` because a button, unlike a link, shows the default cursor —
 * the control should feel exactly as it did when it was an anchor.
 */
export default function SoonLink({
  href,
  what,
  external = false,
  className = "",
  children,
  onClick,
  ...rest
}: {
  href?: string;
  /** names the thing in the toast, e.g. "Discord"; left out, it just says "coming soon" */
  what?: string;
  /** opens in a new tab once it is a real link */
  external?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">) {
  if (href) {
    return (
      <a
        href={href}
        className={className}
        onClick={onClick}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={`cursor-pointer ${className}`}
      onClick={(e) => {
        onClick?.(e);
        comingSoon(what);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
