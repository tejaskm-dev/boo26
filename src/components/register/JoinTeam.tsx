"use client";

import { useEffect, useMemo, useState } from "react";
import StepFrame, { type Step } from "./StepFrame";
import { Agree, CampusFields, Summary, YouFields, memberRows } from "./MemberFields";
import { useSteps } from "./useSteps";
import { useMember } from "./useMember";
import { dropDraft, saveDraft, useOpeningDraft, type Draft } from "./draft";
import { joinTeam } from "@/lib/register/actions";
import { joinPath, teamPath } from "@/lib/register/code";
import { ghostSays } from "@/lib/register/ghost";
import { CAMPUS_FIELDS, EMPTY_MEMBER, YOU_FIELDS, checkCampus, checkYou } from "@/lib/register/fields";
import type { TeamView } from "@/lib/register/store";
import { leaveTo } from "@/lib/leave";
import { toast } from "@/lib/toast";

const KEYS = ["you", "campus", "check"] as const;
const LAST = KEYS.length - 1;

/**
 * Path B: the second of the two, arriving from the code, the link or the QR.
 * The team is already named and waiting, so this is only three steps — and
 * the first one says who's waiting for you. Details typed on Path A in this
 * tab carry over, for anyone who started a team and then got an invite.
 */
export default function JoinTeam({ team, preview }: { team: TeamView; preview: boolean }) {
  const draft = useOpeningDraft();
  return <Form key={draft ? "resumed" : "fresh"} team={team} preview={preview} draft={draft ?? null} />;
}

function Form({ team, preview, draft }: { team: TeamView; preview: boolean; draft: Draft | null }) {
  const captain = team.members[0] ?? "Your teammate";
  const steps: Step[] = useMemo(
    () => [
      { label: "You", title: "Who are\nyou?", note: `${captain}'s\nwaiting for you.`, cat: "cat-playful" },
      { label: "Campus", title: "The\ndetails.", note: "The ASIET bits.\nQuick ones.", cat: "cat-laptop" },
      { label: "Check", title: "Look\nright?", note: "Then you're\na team.", cat: "cat-thinking" },
    ],
    [captain],
  );

  const { at, go, back } = useSteps(KEYS);
  const { member, errors, setErrors, set, touch, ok, passes } = useMember(draft?.member ?? EMPTY_MEMBER);
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState<string>();
  const [busy, setBusy] = useState(false);
  /** back from the look-over to change something: the next Next goes straight back to it */
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (Object.values(member).some(Boolean)) saveDraft({ member });
  }, [member]);

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
      const sent = await joinTeam({ code: team.code, member, agreed });
      if (sent.ok) {
        dropDraft();
        ghostSays("fly");
        leaveTo(`${teamPath(sent.code)}?joined=1`, button);
        return;
      }
      ghostSays("scared");
      toast(sent.message, "Not yet");
      if (sent.gone) {
        // the join page says what happened to the team, and what to do instead
        leaveTo(joinPath(team.code), button);
        return;
      }
      const m = sent.member ?? {};
      setErrors(m);
      if (YOU_FIELDS.some((f) => m[f])) edit(0);
      else if (CAMPUS_FIELDS.some((f) => m[f])) edit(1);
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
    } else {
      void send((e.nativeEvent as SubmitEvent).submitter ?? e.currentTarget);
    }
  };

  const rows = memberRows(member);
  const fields = { prefix: "teammate", member, errors, set, touch, ok };

  return (
    <StepFrame
      kicker={
        <>
          Path B · Joining <span className="text-bone">{team.name}</span>
        </>
      }
      steps={steps}
      at={at}
      onSubmit={onSubmit}
      onBack={at > 0 ? back : undefined}
      backHref="/register"
      next={at === LAST ? (busy ? "Joining…" : `Join ${captain}`) : editing ? "Back to check" : `Next · ${steps[at + 1].label}`}
      busy={busy}
      preview={preview}
    >
      {at === 0 ? <YouFields {...fields} /> : null}
      {at === 1 ? <CampusFields {...fields} /> : null}
      {at === LAST ? (
        <>
          <Summary title="You" onEdit={() => edit(0)} rows={rows.you} />
          <Summary title="Campus" onEdit={() => edit(1)} rows={rows.campus} />
          <div className="border-t border-bone/15 pt-[clamp(1rem,2.5vh,1.4rem)]">
            <p className="label text-bone/45">The team</p>
            <p className="display mt-3 text-[clamp(1.2rem,2vw,1.6rem)] leading-[1.05] text-bone">{team.name}</p>
            <p className="body-copy mt-1.5 text-[0.98rem] text-bone/70">
              With {captain}
              {team.reaction ? ` · going for: ${team.reaction}` : ""}
            </p>
          </div>
          <div className="border-t border-bone/15 pt-[clamp(1.25rem,3vh,1.75rem)]">
            <Agree
              id="teammate-agree"
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
