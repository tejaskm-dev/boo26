# boo26

Boo 2026 Event Website bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Coming soon, or the full site

The whole site is one of two things, decided by one environment variable (see
`.env.example`):

```bash
LIVE_STATUS=true     # the full site: the night, the schedule, the dates
LIVE_STATUS=false    # the coming-soon teaser, and nothing that would date it
```

**Unset means the teaser**, on purpose: the organisers asked for no dates or
timings anywhere until it's announced, and a variable someone forgot to set
should never be what publishes them. It's read where the site is built, like
`REGISTER_URL`, so flipping it takes a new build — on Vercel, change the
variable and redeploy. In exchange the switch costs nothing when someone
visits: both versions are static pages, with no middleware, no check per
request and nothing extra in the browser.

While the teaser is up:

| | |
| --- | --- |
| `/` | the teaser (`src/app/(site)/soon/page.tsx`), served at `/` by a rewrite in `next.config.ts` |
| `/register/*` | "Not yet." — and no redirect to the outside sign-up, whatever `REGISTER_URL` says |
| `/terms`, `/code-of-conduct` | redirect home: both describe the night itself |
| `/privacy` | stays, with a date-free band |
| `/shh` | a hidden page for whoever reads the console |
| `/admin` | unaffected — and `/admin/preview` shows the core team the full site before it's up |

**The two sides are edited separately.** Every word on the teaser is in
`src/lib/soon.ts` (with the rules for writing new ones at the top), and its
sections are in `src/components/soon/`. The full site's words stay in
`src/lib/site.ts` and its sections in `src/components/sections/`. What they
share is the design system — the header, the menu, the footer, the hero and
the loading screen — and those take their words as props from the page that
uses them. That's also what keeps the dates out of the teaser's JavaScript:
nothing a browser downloads imports `site.ts`. Anything that has to be the
same on both sides without dating anything (the name, the venue, the
channels) is in `src/lib/brand.ts`.

In `next dev` the teaser is always at `/soon` too, so it can be worked on
while the full site is the one on `/`.

Which team the full site shows is `TEAM_SECTION` (see `.env.example`): `0`
none (the menu and the section numbers close up round it, and the legal
pages stop pointing to it), `1` the core team, `2` the core team and then the
crew — a black section with a ghost for each of them where the core team have
cats. The crew is `CREW` in `src/lib/site.ts`; until it's filled in, `2` shows
the same as `1`, and the dashboard's preview shows six stand-ins instead.

The full site has jokes of its own (`src/components/site/Survival.tsx`, words
in `SURVIVAL` in `site.ts`), each hinting at the night's prompt without
saying it, and a hidden page the console points to, `/exit` — there only
while the full site is.

The teaser's art is cut by `scripts/cut-teaser-assets.py` from
`design/teaser/` and the older boards in `design/`.

## Registration

Registration runs on an outside page (a form, an event platform), not on this
site. One environment variable says where (see `.env.example`):

```bash
REGISTER_URL=https://…   # /register, and every Register button, redirects here
```

Every Register button points at `/register`, so the address on a poster stays
`boo26.live/register` whatever the outside page turns out to be. The redirect
is in `next.config.ts` and only happens while the full site is live; unset,
`/register` is the "isn't open yet" page. It's read where the site is built,
so changing it needs a new build — on Vercel, a redeploy.

The site's own sign-up (the fork, starting and joining a team, the rules and
the judging pages) is still in the code, whole, but switched off:
`registrationOpen()` in `src/lib/register/mode.ts` returns false, and its
server actions and the ID check ask the same thing. The rest of this section
describes it as it was built, for an edition that registers on the site again.

### What people pick, and what's checked

A department is one of the college's own — AI, DS, EBE, ECE, EEE, CSE, RA, ME,
CE, MBA, M.Tech — rather than a typed answer, so the same department can't
arrive in three spellings and counting them is arithmetic instead of
guesswork. The year is the same kind of choice, as it always was.

A college ID is checked while it's being typed, against everybody already
registered. The sign-up is told only that an ID is taken — never who has it,
because anyone at all can reach that check and college IDs run in sequence.
The dashboard, behind the sign-in, is told the name and the team, since the
whole record is on the page in front of it anyway.

### Where teams are kept

Registrations live in Supabase. Set up once:

1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → paste [`db/schema.sql`](db/schema.sql) → Run. It makes the two
   tables, the rules that keep them honest (one team per name, one person per
   email/number/ID, two seats a team), and a `registrations` view with
   everyone in one place for the night.
3. Project Settings → API: copy the project URL and the `service_role` key
   into `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — in `.env.local` here,
   and in the host's environment variables for a deploy.

The `service_role` key goes past row level security, so it belongs on the
server only: never `NEXT_PUBLIC_`, never in the repo.

With those unset the site keeps teams in its own memory instead. The whole
flow still runs on one machine, but a deploy runs several and a team made on
one request is a stranger to the next — so the pages say teams aren't kept
for good yet, until the database answers.

### The dashboard

`/admin` is the core team's page, in two halves.

**The list** is for looking: how many teams and people, the split by
department and year, a search across names, emails, numbers, codes and notes,
and filters for where a team is in the review or whether it's still short a
teammate. The review filters are toggles — shortlisted alone, or everything
that isn't — and teams can be ordered newest first, by year (1st to 4th) or by
department (A to Z), and gathered into departments or years that fold shut.
Nothing needs applying: each control takes effect as it's changed, and writes
itself into the address, so a view worth coming back to is a link. Ticking a
few teams marks them all at once, and the whole lot exports to CSV.

Where a team's two people disagree — one from CSE, one from ECE — it's the
one who started the team that decides where it's grouped and ordered.

**A team's own page** (`/admin/team/<code>`) is for changing, and holds every
control:

| | |
| --- | --- |
| Review | New → Verified → Shortlisted, Waitlisted or Rejected |
| Note | A line the core team can leave on a team; searchable, never shown to students |
| The team | Rename it, change the answer it's going for |
| Each person | Correct a name, email, number, college ID, department or year — the ID says whose it is if it's taken |
| Taking off | Either person (the seat opens and the invite works again), or the whole team |

Every change is written down with who made it, and shows on both that team's
page and the list. The rules the sign-up holds people to hold here too: one
team per name, one person per email, number and college ID — a correction
can't put in what the form itself would have refused.

Sign-in is Google, and only the emails you list get in. Set up once:

1. [Google Cloud console](https://console.cloud.google.com/apis/credentials) →
   Create credentials → OAuth client ID → Web application.
2. Authorised redirect URIs — add both:
   - `https://<the site>/admin/callback`
   - `http://localhost:3000/admin/callback`
3. Copy the client ID and secret into `GOOGLE_CLIENT_ID` and
   `GOOGLE_CLIENT_SECRET`.
4. `ADMIN_EMAILS`: the Google accounts allowed in, comma separated.
5. `ADMIN_SESSION_SECRET`: a long random string, which signs the cookie that
   keeps an admin signed in — `openssl rand -base64 32`.

After pulling a change that touches the dashboard, run
[`db/schema.sql`](db/schema.sql) again — it's written to be safe to re-run,
and it's where the review state, the notes and the action log live.

Until all four are set the page says which ones are missing rather than
failing quietly. Nothing else has to happen: no invites, no accounts, no
passwords. Adding someone to the core team is one more email in
`ADMIN_EMAILS`; taking them off locks them out on their next request, signed
in or not.

### Previewing the full site

**Preview live site** in the dashboard's bar (and the card at the top of the
list) opens `/admin/preview`: the full site's home page — and its terms, code
of conduct and privacy policy — exactly as `LIVE_STATUS=true` will show them,
on the production deploy, while visitors still get the teaser. It's the real
thing rather than a copy: the same sections, the same shell and loading
screen (`src/components/site/LiveHome.tsx`, `SiteShell.tsx`), in a root layout
of its own (`src/app/(preview)`). Links in it stay in the preview, and the
Register buttons open `REGISTER_URL` if it's set. A tab in the corner says
what's public and where Register goes.

It's for the signed-in core team only. `src/proxy.ts` checks the session before
a preview page is rendered at all — a page that redirects on its own still
lists its scripts in the redirect, and the preview's scripts are the full
site's, dates and all — and every preview page checks again itself. It's
rendered per request (never built into a page someone else could load), it's
never indexed, and the proxy runs for `/admin/preview` alone, so no other
request goes through it. Before the
site goes live, check it there, then set `LIVE_STATUS=true` and redeploy.

It costs the site nothing. `/admin` is a separate root layout, so it loads
none of the site's fonts, animation or smooth scrolling, and the site loads
none of the dashboard; the session cookie is scoped to `/admin`, so no request
a student makes ever carries it; and the page asks not to be indexed.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
