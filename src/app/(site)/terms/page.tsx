import type { Metadata } from "next";
import LegalPage, { type LegalDoc } from "@/components/legal/LegalPage";
import { A, Item, List, P } from "@/components/legal/Prose";
import { EVENT, LEGAL_UPDATED } from "@/lib/site";

export const metadata: Metadata = {
  title: `Terms of Service — ${EVENT.name} ${EVENT.year}`,
  description: `The terms for taking part in ${EVENT.name} ${EVENT.year}, a Halloween-night hackathon at ASIET, Kalady, on ${EVENT.dateLong}.`,
};

/**
 * Facts only from what the site already states. Anything not settled yet —
 * deadlines, payment, refunds, submission rules — is left to the registration
 * portal and the event guidelines rather than guessed at here.
 */
const TERMS: LegalDoc = {
  href: "/terms",
  title: "Terms of Service",
  heading: "Terms of\nService",
  note: "The rules\nof the night.",
  cat: "cat-thinking",
  updated: LEGAL_UPDATED,
  summary: [
    `${EVENT.name} ${EVENT.year} is open to ASIET students, in teams of two.`,
    "Registration is ₹200 per team, once it opens.",
    "What you build is yours.",
    "The Code of Conduct and campus rules apply all night.",
  ],
  clauses: [
    {
      id: "about",
      title: "About these terms",
      body: (
        <>
          <P>
            These terms cover taking part in {EVENT.name} {EVENT.year}, a Halloween-night creative technology hackathon on{" "}
            {EVENT.dateLong} at {EVENT.venueLong}, and using this website.
          </P>
          <P>
            {EVENT.name} is run by the {EVENT.name} core team under the {EVENT.host} banner — &ldquo;we&rdquo; and
            &ldquo;us&rdquo; on this page.
          </P>
          <P>
            By registering for {EVENT.name} {EVENT.year}, you agree to these terms, the{" "}
            <A href="/code-of-conduct">Code of Conduct</A> and the <A href="/privacy">Privacy Policy</A>.
          </P>
        </>
      ),
    },
    {
      id: "who-can-take-part",
      title: "Who can take part",
      body: (
        <List>
          <Item>{EVENT.name} {EVENT.year} is open to students of ASIET only.</Item>
          <Item>Everyone takes part in a team of two, and both of you need to be ASIET students.</Item>
          <Item>Carry your college ID. You may be asked for it at any point during the event.</Item>
        </List>
      ),
    },
    {
      id: "registration",
      title: "Registration and the fee",
      body: (
        <List>
          <Item>Registration isn&rsquo;t open yet. When it opens, you&rsquo;ll register through the registration portal linked from this site.</Item>
          <Item>The fee is ₹200 per team of two — ₹100 each.</Item>
          <Item>
            Give accurate details when you register. We use them to run the event, as the{" "}
            <A href="/privacy">Privacy Policy</A> explains.
          </Item>
          <Item>
            Deadlines, how to pay, and whether the fee can be refunded will be set out on the registration portal. Where the
            portal is more specific than this page, the portal applies.
          </Item>
        </List>
      ),
    },
    {
      id: "the-night",
      title: "The night",
      body: (
        <List>
          <Item>
            {EVENT.name} starts at 2 PM on 24 October and runs for 20 hours, through the night and into the morning of 25
            October.
          </Item>
          <Item>
            Food is provided during the event. Accommodation and sleeping facilities are not — if you need somewhere to stay
            before the event, that&rsquo;s yours to arrange.
          </Item>
          <Item>
            The haunted house, the treasure hunt inside it and the midnight games are part of the night. Joining them is up
            to you.
          </Item>
          <Item>ASIET&rsquo;s rules for students and for the campus apply for the whole event.</Item>
          <Item>Plans can change. If the schedule, the activities or the venue details change, we&rsquo;ll update this site, or tell you at the event.</Item>
        </List>
      ),
    },
    {
      id: "safety",
      title: "Your things, and staying safe",
      body: (
        <List>
          <Item>Bring what you need: your laptop, your charger, and whatever hardware or tools your project needs.</Item>
          <Item>You&rsquo;re responsible for your own belongings. We can&rsquo;t take responsibility for anything lost, stolen or damaged.</Item>
          <Item>
            Nothing dangerous — no weapons, open flames or fuel. If your project involves anything that could hurt someone,
            such as heat, high voltage or sharp moving parts, check with us before you bring it.
          </Item>
          <Item>Safety information will be in the event guidelines on the registration portal.</Item>
        </List>
      ),
    },
    {
      id: "your-work",
      title: "What you build",
      body: (
        <List>
          <Item>What your team builds at {EVENT.name} belongs to your team.</Item>
          <Item>Any stack, any tools. If you use someone else&rsquo;s code, art, sound or data, make sure you&rsquo;re allowed to, and credit it.</Item>
          <Item>The event guidelines will set out what you can prepare beforehand and what to submit.</Item>
          <Item>
            We may mention your team and your project — its name, a line about it, a screenshot — when we talk about{" "}
            {EVENT.name}. If you&rsquo;d rather we didn&rsquo;t, tell us.
          </Item>
        </List>
      ),
    },
    {
      id: "judging",
      title: "Judging",
      body: (
        <List>
          <Item>Judging criteria will be published in the event guidelines.</Item>
          <Item>The judges&rsquo; decisions are final.</Item>
        </List>
      ),
    },
    {
      id: "conduct",
      title: "Conduct",
      body: (
        <P>
          Everyone at {EVENT.name} follows the <A href="/code-of-conduct">Code of Conduct</A>. We can refuse entry to, or
          remove, anyone who breaks it, these terms or the campus rules, and disqualify their team.
        </P>
      ),
    },
    {
      id: "this-website",
      title: "This website",
      body: (
        <List>
          <Item>This site is here to tell you about {EVENT.name} {EVENT.year}. Anything marked &ldquo;coming soon&rdquo; isn&rsquo;t live yet.</Item>
          <Item>The {EVENT.name} name, the wordmark, the cats and the rest of the artwork belong to the {EVENT.name} team. Ask before reusing them.</Item>
          <Item>Links to other sites, like the core team&rsquo;s LinkedIn and Instagram profiles, go to services we don&rsquo;t run, with their own terms.</Item>
          <Item>
            We keep the details here accurate, but they can change. The registration portal and the event guidelines have the
            final word on specifics.
          </Item>
        </List>
      ),
    },
    {
      id: "changes",
      title: "Changes to these terms",
      body: (
        <P>
          We&rsquo;ll update these terms as {EVENT.name} takes shape — when registration opens, for example. The date at the
          top of this page shows the latest version.
        </P>
      ),
    },
    {
      id: "questions",
      title: "Questions",
      body: (
        <P>
          Email us at <A href={`mailto:${EVENT.email}`}>{EVENT.email}</A>, or ask any of the core team — you&rsquo;ll find
          all of us, with our links, under <A href="/#team">The People</A> on the home page.
        </P>
      ),
    },
  ],
};

export default function TermsPage() {
  return <LegalPage doc={TERMS} />;
}
