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

## Registration

`/register` and everything under it is either the sign-up or the coming-soon
page, decided by one environment variable (see `.env.example`):

```bash
BOO_REGISTRATION_OPEN=true    # the sign-up: the fork, the rules, the judging
BOO_REGISTRATION_OPEN=false   # the coming-soon page on every /register path
```

Unset means open. Set it in `.env.local` here, or in the host's environment
variables for a deploy. It's read where the pages are built, so changing it
needs a new build — on Vercel, a redeploy.

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
teammate. Ticking a few teams marks them all at once, and the whole lot
exports to CSV.

**A team's own page** (`/admin/team/<code>`) is for changing, and holds every
control:

| | |
| --- | --- |
| Review | New → Verified → Shortlisted, Waitlisted or Rejected |
| Note | A line the core team can leave on a team; searchable, never shown to students |
| The team | Rename it, change the answer it's going for |
| Each person | Correct a name, email, number, college ID, department or year |
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
