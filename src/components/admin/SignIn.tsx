/**
 * The whole of /admin until someone is signed in: one button, and — if the
 * environment isn't set up yet — exactly which pieces are missing, so it says
 * what to do instead of failing quietly.
 */
export default function SignIn({ missing, trouble }: { missing: string[]; trouble?: string }) {
  const problem =
    trouble === "denied"
      ? "That account isn't on the list. Ask someone who's already in to add your email to ADMIN_EMAILS."
      : trouble === "google"
        ? "Google didn't confirm that sign-in. Try again."
        : trouble === "state"
          ? "That sign-in took too long, or came back oddly. Try again."
          : null;

  return (
    <main className="grid min-h-svh place-items-center px-[var(--edge)] py-16">
      <div className="w-full max-w-[32rem]">
        <p className="label label-loose text-bone/45">BOO! 2026</p>
        <h1 className="display mt-4 text-[clamp(2rem,5vw,3rem)] leading-[0.95]">Registrations</h1>
        <p className="body-copy mt-4 text-[0.98rem] text-bone/65">
          Students&rsquo; names, emails and numbers live behind this page. Only the core team gets in.
        </p>

        {problem ? (
          <p className="body-copy mt-6 flex gap-3 border-l-2 border-lime pl-4 text-[0.95rem] text-bone/80">{problem}</p>
        ) : null}

        {missing.length ? (
          <div className="mt-8 border-t border-bone/15 pt-6">
            <p className="label text-bone/45">Not set up yet</p>
            <p className="body-copy mt-3 text-[0.95rem] text-bone/70">
              Sign-in needs these in the environment before it can work:
            </p>
            <ul className="mt-3 space-y-1.5">
              {missing.map((name) => (
                <li key={name} className="body-copy text-[0.92rem] text-bone">
                  <code className="rounded bg-bone/10 px-2 py-0.5">{name}</code>
                </li>
              ))}
            </ul>
            <p className="body-copy mt-4 text-[0.9rem] text-bone/50">See README → Registration → The dashboard.</p>
          </div>
        ) : (
          <a
            href="/admin/signin"
            className="label mt-8 inline-flex items-center gap-3 bg-lime px-6 py-4 text-ink outline-none transition-transform duration-300 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            <svg viewBox="0 0 18 18" className="h-[1.1rem] w-[1.1rem]" aria-hidden="true">
              <path
                fill="currentColor"
                d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.5h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.6Z"
              />
              <path
                fill="currentColor"
                d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18Z"
              />
              <path fill="currentColor" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3Z" />
              <path
                fill="currentColor"
                d="M9 3.6c1.3 0 2.5.5 3.4 1.3L15 2.3A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6Z"
              />
            </svg>
            Sign in with Google
          </a>
        )}
      </div>
    </main>
  );
}
