import type { Metadata } from "next";
import LegalPage, { type LegalDoc } from "@/components/legal/LegalPage";
import { A, Item, List, P } from "@/components/legal/Prose";
import { EVENT, LEGAL_UPDATED } from "@/lib/site";

export const metadata: Metadata = {
  title: `Code of Conduct — ${EVENT.name} ${EVENT.year}`,
  description: `How everyone at ${EVENT.name} ${EVENT.year} looks after each other: make people react, never make them unsafe.`,
};

const CONDUCT: LegalDoc = {
  href: "/code-of-conduct",
  title: "Code of Conduct",
  heading: "Code of\nConduct",
  note: "Scares are for\nthe haunted house.",
  cat: "cat-scared",
  updated: LEGAL_UPDATED,
  summary: [
    "Make people react. Never make them unsafe.",
    "No harassment, of anyone, in any form.",
    "Every scare is opt-in, and “stop” means stop.",
    "Something wrong? Tell any of the core team.",
  ],
  clauses: [
    {
      id: "why",
      title: "Why this exists",
      body: (
        <>
          <P>
            {EVENT.name} is built around one idea: make someone react. Jumping, laughing, &ldquo;how did you do
            that?&rdquo; — that&rsquo;s the point. Feeling unsafe, singled out or harassed is not.
          </P>
          <P>
            This code applies to everyone at {EVENT.name} {EVENT.year}, participants and the core team alike: at the venue,
            on the way in and out, and in any {EVENT.name} space online.
          </P>
        </>
      ),
    },
    {
      id: "what-we-expect",
      title: "What we expect",
      body: (
        <List>
          <Item>Be kind and respectful — to people, their ideas, their work and their space.</Item>
          <Item>Help each other. Explain things, share what you know, and welcome people who are new to this.</Item>
          <Item>Look out for your teammate, and for everyone else, through the night.</Item>
          <Item>Respect the campus. ASIET&rsquo;s rules for students apply all night.</Item>
          <Item>Leave every room the way you found it.</Item>
        </List>
      ),
    },
    {
      id: "not-okay",
      title: "What’s not okay",
      body: (
        <>
          <P>Harassment of any kind, towards anyone. That includes:</P>
          <List>
            <Item>
              Comments or jokes that put someone down for their gender, gender identity, sexual orientation, disability,
              appearance, body, caste, religion, race, region, language or background.
            </Item>
            <Item>Unwelcome physical contact, or unwelcome sexual attention of any kind.</Item>
            <Item>Intimidating, stalking or following someone.</Item>
            <Item>Photographing or recording someone who has asked you not to.</Item>
            <Item>Repeatedly disrupting talks, judging or another team&rsquo;s work.</Item>
            <Item>Threats or violence — or encouraging anyone else to do any of this.</Item>
          </List>
          <P>Also not okay: copying another team&rsquo;s work, sabotaging a project, or cheating in judging or the games.</P>
        </>
      ),
    },
    {
      id: "scares",
      title: "Scares, done right",
      body: (
        <List>
          <Item>
            The haunted house, the treasure hunt and the midnight games are meant to be scary fun. Every one of them is
            opt-in.
          </Item>
          <Item>You can leave any of them at any point, with no questions and no teasing.</Item>
          <Item>&ldquo;Stop&rdquo; means stop — for everyone, every time.</Item>
          <Item>Never touch someone to scare them.</Item>
          <Item>No pranks outside the planned activities, and nothing that could actually hurt anyone.</Item>
        </List>
      ),
    },
    {
      id: "looking-after-yourself",
      title: "Looking after yourself",
      body: (
        <List>
          <Item>No alcohol, drugs or smoking at the event.</Item>
          <Item>No weapons, or anything else that could hurt someone.</Item>
          <Item>Take breaks, drink water, and rest when you need to. It&rsquo;s a long night.</Item>
          <Item>If you feel unwell or unsafe, tell one of the core team straight away.</Item>
        </List>
      ),
    },
    {
      id: "online",
      title: "Online, too",
      body: (
        <P>
          The same rules apply in {EVENT.name}&rsquo;s online spaces once they&rsquo;re live, and in anything you post about{" "}
          {EVENT.name}.
        </P>
      ),
    },
    {
      id: "reporting",
      title: "Reporting a problem",
      body: (
        <List>
          <Item>
            If something happens to you, or you see something that isn&rsquo;t okay, tell any of the core team — in person at
            the event, by email at <A href={`mailto:${EVENT.email}`}>{EVENT.email}</A>, or through the links on our cards
            under <A href="/#team">The People</A>.
          </Item>
          <Item>We&rsquo;ll listen, take it seriously, and keep it as private as we can.</Item>
          <Item>In an emergency, call 112 first. Then tell us.</Item>
        </List>
      ),
    },
    {
      id: "what-happens-next",
      title: "What happens next",
      body: (
        <List>
          <Item>Anyone asked to stop is expected to stop straight away.</Item>
          <Item>
            Depending on what happened, we may warn you, ask you to leave the event, disqualify your team, or report it to
            ASIET.
          </Item>
          <Item>We decide as the organisers, and the safety of the people affected comes first.</Item>
        </List>
      ),
    },
    {
      id: "changes",
      title: "Changes to this code",
      body: (
        <P>
          We may update this code as the event takes shape. The latest version is always this page, dated at the top; see
          also the <A href="/terms">Terms of Service</A>.
        </P>
      ),
    },
  ],
};

export default function CodeOfConductPage() {
  return <LegalPage doc={CONDUCT} />;
}
