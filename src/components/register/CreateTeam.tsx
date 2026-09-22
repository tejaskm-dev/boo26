"use client";

import { useState } from "react";
import StepFrame, { type Step } from "./StepFrame";
import { ChoiceField, TextField } from "./Fields";
import { Agree, CampusFields, Summary, YouFields, memberRows } from "./MemberFields";
import { useSteps } from "./useSteps";
import { createTeam } from "@/app/register/actions";
import { REACTIONS } from "@/lib/register/content";
import { teamPath } from "@/lib/register/code";
import {
  CAMPUS_FIELDS,
  EMPTY_MEMBER,
  EMPTY_TEAM,
  YOU_FIELDS,
  checkCampus,
  checkTeam,
  checkYou,
  hasErrors,
  type Errors,
  type Member,
  type TeamDetails,
} from "@/lib/register/fields";
import { leaveTo } from "@/lib/leave";
import { toast } from "@/lib/toast";

const KEYS = ["you", "campus", "team", "check"] as const;

const STEPS: Step[] = [
  { label: "You", title: "Who's\nstarting?", note: "That's you.\nThe captain.", cat: "cat-curious" },
  { label: "Campus", title: "The\ndetails.", note: "Plus one very\nimportant question.", cat: "cat-laptop" },
  { label: "Team", title: "Name the\nteam.", note: "Make it one\nthey'll remember.", cat: "cat-excited" },
  { label: "Check", title: "Look\nright?", note: "Last chance\nto fix a typo.", cat: "cat-thinking" },
];

const REACTION_OPTIONS = [{ value: "", label: "Not sure yet" }, ...REACTIONS.map((r) => ({ value: r, label: r }))];

/**
 * Path A: one of the two starts the team. Four short steps — you, your
 * college, the team, a look over it all — then the team exists and this page
 * wipes over to it, where the code, the link and the QR are waiting to be
 * sent on.
 */
export default function CreateTeam({ preview }: { preview: boolean }) {
  const { at, go, back } = useSteps(KEYS);
  const [member, setMember] = useState<Member>(EMPTY_MEMBER);
  const [team, setTeam] = useState<TeamDetails>(EMPTY_TEAM);
  const [agreed, setAgreed] = useState(false);
  const [memberErrors, setMemberErrors] = useState<Errors<Member>>({});
  const [teamErrors, setTeamErrors] = useState<Errors<TeamDetails>>({});
  const [agreeError, setAgreeError] = useState<string>();
  const [busy, setBusy] = useState(false);

  // an edit clears that field's note: it's being dealt with
  const setM = (field: keyof Member, value: string) => {
    setMember((m) => ({ ...m, [field]: value }));
    setMemberErrors((e) => ({ ...e, [field]: undefined }));
  };
  const setT = (field: keyof TeamDetails, value: string) => {
    setTeam((t) => ({ ...t, [field]: value }));
    setTeamErrors((e) => ({ ...e, [field]: undefined }));
  };

  const send = async (button: Element) => {
    if (busy) return;
    if (!agreed) {
      setAgreeError("Tick this to carry on.");
      return;
    }
    setBusy(true);
    try {
      const sent = await createTeam({ team, member, agreed });
      if (sent.ok) {
        // stays busy: the page is on its way out
        leaveTo(`${teamPath(sent.code)}?new=1`, button);
        return;
      }
      // put each message back beside its field, and go to the first step that has one
      const m = sent.member ?? {};
      const t = sent.team ?? {};
      setMemberErrors(m);
      setTeamErrors(t);
      if (YOU_FIELDS.some((f) => m[f])) go(0);
      else if (CAMPUS_FIELDS.some((f) => m[f])) go(1);
      else if (hasErrors(t)) go(2);
      toast(sent.message, "Not yet");
    } catch {
      toast("Couldn't reach BOO! Check your connection and try again.", "Not sent");
    }
    setBusy(false);
  };

  // A step's own check joins whatever notes are still standing, so one the
  // server left on a later step is still there when the reader gets to it.
  // Only this step's fields hold it back.
  const advance = (found: Errors<Member>, fields: readonly (keyof Member)[], to: number) => {
    const notes = { ...memberErrors, ...found };
    setMemberErrors(notes);
    if (!fields.some((f) => notes[f])) go(to);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (at === 0) advance(checkYou(member), YOU_FIELDS, 1);
    else if (at === 1) advance(checkCampus(member), CAMPUS_FIELDS, 2);
    else if (at === 2) {
      const notes = { ...teamErrors, ...checkTeam(team, REACTIONS) };
      setTeamErrors(notes);
      if (!hasErrors(notes)) go(3);
    } else {
      const submitter = (e.nativeEvent as SubmitEvent).submitter ?? e.currentTarget;
      void send(submitter);
    }
  };

  const rows = memberRows(member);

  return (
    <StepFrame
      kicker="Path A · Start a team"
      steps={STEPS}
      at={at}
      onSubmit={onSubmit}
      onBack={at > 0 ? back : undefined}
      backHref="/register"
      next={at < 3 ? "Next" : busy ? "Creating…" : "Create the team"}
      busy={busy}
      preview={preview}
    >
      {at === 0 ? <YouFields prefix="captain" member={member} errors={memberErrors} set={setM} /> : null}
      {at === 1 ? <CampusFields prefix="captain" member={member} errors={memberErrors} set={setM} /> : null}
      {at === 2 ? (
        <>
          <TextField
            id="team-name"
            index="01"
            label="Team name"
            value={team.name}
            onChange={(v) => setT("name", v)}
            error={teamErrors.name}
            hint="Up to 32 characters. It goes on the team page, and on the night."
            autoComplete="off"
            enterKeyHint="next"
            maxLength={32}
          />
          <ChoiceField
            id="team-reaction"
            index="02"
            label="The reaction you're after"
            optional
            name="team-reaction"
            options={REACTION_OPTIONS}
            value={team.reaction}
            onChange={(v) => setT("reaction", v)}
            error={teamErrors.reaction}
            hint="You can change your mind on the night."
          />
        </>
      ) : null}
      {at === 3 ? (
        <>
          <Summary title="You" onEdit={() => go(0)} rows={rows.you} />
          <Summary title="Campus" onEdit={() => go(1)} rows={rows.campus} />
          <Summary
            title="Team"
            onEdit={() => go(2)}
            rows={[team.name.trim(), team.reaction ? `Going for: ${team.reaction}` : "Reaction: not sure yet"]}
          />
          <div className="border-t border-bone/15 pt-[clamp(1.25rem,3vh,1.75rem)]">
            <Agree
              id="captain-agree"
              checked={agreed}
              onChange={(v) => {
                setAgreed(v);
                setAgreeError(undefined);
              }}
              error={agreeError}
            />
          </div>
        </>
      ) : null}
    </StepFrame>
  );
}
