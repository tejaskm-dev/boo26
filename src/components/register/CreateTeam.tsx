"use client";

import { useEffect, useState } from "react";
import StepFrame, { type Step } from "./StepFrame";
import { ChoiceField, TextField } from "./Fields";
import { Agree, CampusFields, Summary, YouFields, memberRows } from "./MemberFields";
import { useSteps } from "./useSteps";
import { useMember } from "./useMember";
import { dropDraft, saveDraft, useOpeningDraft, type Draft } from "./draft";
import { createTeam } from "@/app/register/actions";
import { REACTIONS } from "@/lib/register/content";
import { teamPath } from "@/lib/register/code";
import { ghostSays } from "@/lib/register/ghost";
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
  type TeamDetails,
} from "@/lib/register/fields";
import { leaveTo } from "@/lib/leave";
import { toast } from "@/lib/toast";

const KEYS = ["you", "campus", "team", "check"] as const;
const LAST = KEYS.length - 1;

const STEPS: Step[] = [
  { label: "You", title: "Who's\nstarting?", note: "That's you.\nThe captain.", cat: "cat-curious" },
  { label: "Campus", title: "The\ndetails.", note: "The ASIET bits.\nQuick ones.", cat: "cat-laptop" },
  { label: "Team", title: "Name the\nteam.", note: "Make it one\nthey'll remember.", cat: "cat-excited" },
  { label: "Check", title: "Look\nright?", note: "Last chance\nto fix a typo.", cat: "cat-thinking" },
];

const REACTION_OPTIONS = [{ value: "", label: "Not sure yet" }, ...REACTIONS.map((r) => ({ value: r, label: r }))];

/**
 * Path A: one of the two starts the team. Four short steps — you, your
 * college, the team, a look over it all — then the team exists and this page
 * wipes over to it, where the code, the link and the QR are waiting to be
 * sent on.
 *
 * Drawn first exactly as the server drew it; then, if this tab was part-way
 * through a sign-up, once more with what was typed (./draft.ts).
 */
export default function CreateTeam({ preview }: { preview: boolean }) {
  const draft = useOpeningDraft();
  return <Form key={draft ? "resumed" : "fresh"} preview={preview} draft={draft ?? null} />;
}

function Form({ preview, draft }: { preview: boolean; draft: Draft | null }) {
  const { at, go, back } = useSteps(KEYS);
  const {
    member,
    errors: memberErrors,
    setErrors: setMemberErrors,
    set: setM,
    touch,
    ok,
    passes,
  } = useMember(draft?.member ?? EMPTY_MEMBER);
  const [team, setTeam] = useState<TeamDetails>(draft?.team ?? EMPTY_TEAM);
  const [teamErrors, setTeamErrors] = useState<Errors<TeamDetails>>({});
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState<string>();
  const [busy, setBusy] = useState(false);
  /** back from the look-over to change something: the next Next goes straight back to it */
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (Object.values(member).some(Boolean) || team.name || team.reaction) saveDraft({ member, team });
  }, [member, team]);

  const setT = (field: keyof TeamDetails, value: string) => {
    setTeam((t) => ({ ...t, [field]: value }));
    setTeamErrors((e) => ({ ...e, [field]: undefined }));
  };

  const onward = (to: number) => {
    if (!editing) return go(to);
    setEditing(false);
    go(LAST);
  };

  const edit = (i: number) => {
    setEditing(true);
    go(i);
  };

  const send = async (button: Element) => {
    if (busy) return;
    if (!agreed) {
      setAgreeError("Tick this to carry on.");
      ghostSays("scared");
      return;
    }
    setBusy(true);
    try {
      const sent = await createTeam({ team, member, agreed });
      if (sent.ok) {
        // stays busy: the page is on its way out
        dropDraft();
        ghostSays("fly");
        leaveTo(`${teamPath(sent.code)}?new=1`, button);
        return;
      }
      // each message back beside its field, then the first step that has one
      const m = sent.member ?? {};
      const t = sent.team ?? {};
      setMemberErrors(m);
      setTeamErrors(t);
      const to = YOU_FIELDS.some((f) => m[f]) ? 0 : CAMPUS_FIELDS.some((f) => m[f]) ? 1 : hasErrors(t) ? 2 : -1;
      if (to >= 0) edit(to);
      ghostSays("scared");
      toast(sent.message, "Not yet");
    } catch {
      ghostSays("scared");
      toast("Couldn't reach BOO! Check your connection and try again.", "Not sent");
    }
    setBusy(false);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (at === 0) {
      if (passes(checkYou(member), YOU_FIELDS)) onward(1);
    } else if (at === 1) {
      if (passes(checkCampus(member), CAMPUS_FIELDS)) onward(2);
    } else if (at === 2) {
      const notes = { ...teamErrors, ...checkTeam(team, REACTIONS) };
      setTeamErrors(notes);
      if (hasErrors(notes)) ghostSays("scared");
      else onward(3);
    } else {
      void send((e.nativeEvent as SubmitEvent).submitter ?? e.currentTarget);
    }
  };

  const rows = memberRows(member);
  const fields = { prefix: "captain", member, errors: memberErrors, set: setM, touch, ok };

  return (
    <StepFrame
      kicker="Path A · Start a team"
      steps={STEPS}
      at={at}
      onSubmit={onSubmit}
      onBack={at > 0 ? back : undefined}
      backHref="/register"
      next={at === LAST ? (busy ? "Creating…" : "Create the team") : editing ? "Back to check" : `Next · ${STEPS[at + 1].label}`}
      busy={busy}
      preview={preview}
    >
      {at === 0 ? <YouFields {...fields} /> : null}
      {at === 1 ? <CampusFields {...fields} /> : null}
      {at === 2 ? (
        <>
          <TextField
            id="team-name"
            index="01"
            label="Team name"
            value={team.name}
            onChange={(v) => setT("name", v)}
            ok={!!team.name.trim() && !teamErrors.name && !checkTeam(team, REACTIONS).name}
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
      {at === LAST ? (
        <>
          <Summary title="You" onEdit={() => edit(0)} rows={rows.you} />
          <Summary title="Campus" onEdit={() => edit(1)} rows={rows.campus} />
          <Summary
            title="Team"
            onEdit={() => edit(2)}
            rows={[team.name.trim(), team.reaction ? `Going for: ${team.reaction}` : "Reaction: not sure yet"]}
          />
          <div className="border-t border-bone/15 pt-[clamp(1.25rem,3vh,1.75rem)]">
            <Agree
              id="captain-agree"
              checked={agreed}
              onChange={(v) => {
                setAgreed(v);
                setAgreeError(undefined);
                if (v) ghostSays("cheer");
              }}
              error={agreeError}
            />
          </div>
        </>
      ) : null}
    </StepFrame>
  );
}
