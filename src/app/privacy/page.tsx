import type { Metadata } from "next";
import LegalPage, { type LegalDoc } from "@/components/legal/LegalPage";
import { A, Item, Key, List, P } from "@/components/legal/Prose";
import { EVENT, LEGAL_UPDATED } from "@/lib/site";
import { STORAGE } from "@/lib/storage";

export const metadata: Metadata = {
  title: `Privacy Policy — ${EVENT.name} ${EVENT.year}`,
  description: `What the ${EVENT.name} ${EVENT.year} website and event do with information about you. No cookies, no analytics, no trackers.`,
};

/**
 * What the site does is checked, not assumed: it loads nothing from any other
 * origin, sets no cookies and no localStorage, and the only things it keeps are
 * the session-storage keys in src/lib/storage.ts, listed from there. The
 * footer's newsletter form sends nothing. Registration isn't built yet, so
 * that part says what it will be for, not what it will ask.
 */
const PRIVACY: LegalDoc = {
  href: "/privacy",
  title: "Privacy Policy",
  heading: "Privacy\nPolicy",
  note: "We don't\ncollect much.\nPromise.",
  cat: "cat-hooded",
  catScale: 1,
  updated: LEGAL_UPDATED,
  summary: [
    "No cookies, no analytics and no trackers on this site.",
    "A few small notes live in your browser tab, and go when you close it.",
    "The newsletter box isn't connected yet. Nothing you type is sent.",
    `When registration opens, we'll ask only for what ${EVENT.name} needs, and never sell it.`,
  ],
  clauses: [
    {
      id: "who-we-are",
      title: "Who we are",
      body: (
        <P>
          {EVENT.name} {EVENT.year} is run by the {EVENT.name} core team under the {EVENT.host} banner, at{" "}
          {EVENT.venueLong}. This policy covers this website and the information we&rsquo;ll collect to run{" "}
          {EVENT.name} {EVENT.year}.
        </P>
      ),
    },
    {
      id: "this-website",
      title: "What this website collects",
      body: (
        <List>
          <Item>Nothing that identifies you. There are no accounts, cookies, analytics or advertising trackers here.</Item>
          <Item>
            The fonts, the images and the code all come from this site itself, so visiting doesn&rsquo;t tell anyone else
            you were here.
          </Item>
          <Item>
            Like any website, the server that delivers these pages may keep brief technical logs — IP address, browser, the
            page requested and when — to keep the site running and secure. We don&rsquo;t use them to track you.
          </Item>
        </List>
      ),
    },
    {
      id: "your-browser",
      title: "What stays in your browser",
      body: (
        <>
          <P>
            The site keeps up to three small notes in your browser&rsquo;s session storage. They never leave your device,
            and they&rsquo;re deleted when you close the tab.
          </P>
          <List>
            <Item>
              <Key>{STORAGE.seen}</Key> — you&rsquo;ve seen the full intro, so the next page opens with a shorter one.
            </Item>
            <Item>
              <Key>{STORAGE.wipe}</Key> — the moment you left a page through its transition, so the next page can finish
              it. After a few seconds it means nothing.
            </Item>
            <Item>
              <Key>{STORAGE.tilt}</Key> — on iPhone and iPad only: you allowed motion access, so you aren&rsquo;t asked again
              this visit.
            </Item>
          </List>
          <P>If your browser blocks storage, the site still works. It just plays the full intro every time.</P>
        </>
      ),
    },
    {
      id: "motion",
      title: "Motion and tilt",
      body: (
        <P>
          On a phone, the artwork leans as you tilt it. That uses your device&rsquo;s orientation, read by the page and used
          only to move the pictures: it isn&rsquo;t stored or sent anywhere. On iPhone and iPad, Safari asks your permission
          first, and saying no changes nothing else. If you&rsquo;ve asked your device to reduce motion, none of this runs.
        </P>
      ),
    },
    {
      id: "newsletter",
      title: "The newsletter box",
      body: (
        <P>
          The email box in the footer isn&rsquo;t connected to anything yet. Submitting it only shows &ldquo;Coming
          soon&rdquo; — the address you typed isn&rsquo;t sent or saved. We&rsquo;ll update this policy before sign-ups open.
        </P>
      ),
    },
    {
      id: "registration",
      title: "When you register",
      body: (
        <>
          <P>
            Registration isn&rsquo;t open yet. When it opens, the form will ask for what we need to run the event — things
            like your name, your contact details, your college details and your team.
          </P>
          <List>
            <Item>
              We&rsquo;ll use it to organise {EVENT.name} {EVENT.year}: confirming places, planning food and the night,
              keeping everyone safe, and getting in touch with you about the event.
            </Item>
            <Item>We&rsquo;ll never sell it, and never use it for anything unrelated to {EVENT.name}.</Item>
            <Item>
              The core team can see it. If ASIET or {EVENT.host} need something to run the event — a list of who&rsquo;s on
              campus overnight, say — we&rsquo;ll share only that.
            </Item>
            <Item>
              If the registration portal runs on another service, that service&rsquo;s own privacy policy applies to it too,
              and we&rsquo;ll name it on the portal.
            </Item>
          </List>
          <P>We&rsquo;ll update this page with exactly what&rsquo;s collected before registration opens.</P>
        </>
      ),
    },
    {
      id: "at-the-event",
      title: "At the event",
      body: (
        <List>
          <Item>
            Photos and video: if we take them at {EVENT.name}, we&rsquo;ll say so at the venue. Tell any of the core team if
            you&rsquo;d rather not be in them.
          </Item>
          <Item>
            If someone&rsquo;s safety is at risk, we may share what&rsquo;s needed with ASIET staff or the emergency services.
          </Item>
        </List>
      ),
    },
    {
      id: "keeping-it",
      title: "How long we keep it",
      body: (
        <P>
          We&rsquo;ll keep registration details only for as long as we need them to run {EVENT.name} {EVENT.year} and wrap
          it up, and then delete them.
        </P>
      ),
    },
    {
      id: "your-choices",
      title: "Your choices",
      body: (
        <List>
          <Item>
            You can ask us what we hold about you, ask us to correct it, or ask us to delete it — write to{" "}
            <A href={`mailto:${EVENT.email}`}>{EVENT.email}</A>.
          </Item>
          <Item>You can clear or block session storage in your browser&rsquo;s settings at any time.</Item>
          <Item>You can say no to motion access on iPhone and iPad, or turn on reduced motion on any device.</Item>
        </List>
      ),
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: (
        <P>
          We&rsquo;ll update this page whenever anything here changes, and before registration or the newsletter opens. The
          date at the top shows the latest version.
        </P>
      ),
    },
    {
      id: "questions",
      title: "Questions and requests",
      body: (
        <P>
          Email <A href={`mailto:${EVENT.email}`}>{EVENT.email}</A> with any question about this policy or a request about
          your information. Or talk to any of the core team — you&rsquo;ll find all of us, with our links, under{" "}
          <A href="/#team">The People</A> on the home page.
        </P>
      ),
    },
  ],
};

export default function PrivacyPage() {
  return <LegalPage doc={PRIVACY} />;
}
