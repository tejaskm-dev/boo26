const PATHS: Record<string, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  x: <path d="M4 3h3.8l4.3 5.9L17.1 3H20l-6.4 7.6L20.6 21h-3.9l-4.6-6.3L6.4 21H3.5l6.8-8.1L4 3Z" fill="currentColor" stroke="none" />,
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.4 10.6V17M7.4 7.4v.1M11.4 17v-3.6a2.2 2.2 0 0 1 4.4 0V17" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.8v4.4l4-2.2-4-2.2Z" />
    </>
  ),
  discord: (
    <path
      d="M8.6 7.4A13 13 0 0 1 12 7a13 13 0 0 1 3.4.4c1.7.4 3 1 3 1 1.4 2.2 2 4.6 1.8 7.2a12 12 0 0 1-3.7 2l-.9-1.4M8.4 16.2 7.5 17.6a12 12 0 0 1-3.7-2c-.2-2.6.4-5 1.8-7.2 0 0 1.3-.6 3-1M9.6 13.4h.01M14.4 13.4h.01M7.8 16.2a12 12 0 0 0 8.4 0"
    />
  ),
};

export default function SocialIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
