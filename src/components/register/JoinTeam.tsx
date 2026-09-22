"use client";

import { useMemo, useState } from "react";
import StepFrame, { type Step } from "./StepFrame";
import { Agree, CampusFields, Summary, YouFields, memberRows } from "./MemberFields";
import { useSteps } from "./useSteps";
import { joinTeam } from "@/app/register/actions";
import { joinPath, teamPath } from "@/lib/register/code";
import {
  CAMPUS_FIELDS,
  EMPTY_MEMBER,
  YOU_FIELDS,
  checkCampus,
  checkYou,
  type Errors,
  type Member,
} from "@/lib/register/fields";
import type { TeamView } from "@/lib/register/store";
import { leaveTo } from "@/lib/leave";
import { toast } from "@/lib/toast";

const KEYS = ["you", "campus", "check"] as const;

/**
 * Path B: the second of the two, arriving from the code, the link or the QR.
 * The team is already named and waiting, so this is only three steps — and
 * the first one says who's waiting for you.
 */
export default function JoinTeam({ team, preview }: { team: TeamView; preview: boolean }) {
  const captain = team.members[0] ?? "Your teammate";
  const steps: Step[] = useMemo(
    () => [
      { label: "You", title: "Who are\nyou?", note: `${captain}'s\nwaiting for you.`, cat: "cat-playful" },
      { label: "Campus", title: "The\ndetails.", note: "Plus one very\nimportant question.", cat: "cat-laptop" },
      { label: "Check", title: "Look\nright?", note: "Then you're\na team.", cat: "cat-thinking" },
    ],
    [captain],
  );

  const { at, go, back } = useSteps(KEYS);
  const [member, setMember] = useState<Member>(EMPTY_MEMBER);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors<Member>>({});
  const [agreeError, setAgreeError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const set = (field: keyof Member, value: string) => {
    setMember((m) => ({ ...m, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const send = async (button: Element) => {
    if (busy) return;
    if (!agreed) {
      setAgreeError("Tick this to carry on.");
      return;
    }
    setBusy(true);
    try {
      const sent = await joinTeam({ code: team.code, member, agreed });
      if (sent.ok) {
        leaveTo(`${teamPath(sent.code)}?joined=1`, button);
        return;
      }
      toast(sent.message, "Not yet");
      if (sent.gone) {
        // the join page says what happened to the team, and what to do instead
        leaveTo(joinPath(team.code), button);
        return;
      }
      const m = sent.member ?? {};
      setErrors(m);
      if (YOU_FIELDS.some((f) => m[f])) go(0);
      else if (CAMPUS_FIELDS.some((f) => m[f])) go(1);
    } catch {
      toast("Couldn't reach BOO! Check your connection and try again.", "Not sent");
    }
    setBusy(false);
  };

  // as in CreateTeam: a later step's note from the server survives this step's check
  const advance = (found: Errors<Member>, fields: readonly (keyof Member)[], to: number) => {
    const notes = { ...errors, ...found };
    setErrors(notes);
    if (!fields.some((f) => notes[f])) go(to);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (at === 0) advance(checkYou(member), YOU_FIELDS, 1);
    else if (at === 1) advance(checkCampus(member), CAMPUS_FIELDS, 2);
    else {
      void send((e.nativeEvent as SubmitEvent).submitter ?? e.currentTarget);
    }
  };

  const rows = memberRows(member);

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
      next={at < 2 ? "Next" : busy ? "Joining…" : `Join ${captain}`}
      busy={busy}
      preview={preview}
    >
      {at === 0 ? <YouFields prefix="teammate" member={member} errors={errors} set={set} /> : null}
      {at === 1 ? <CampusFields prefix="teammate" member={member} errors={errors} set={set} /> : null}
      {at === 2 ? (
        <>
          <Summary title="You" onEdit={() => go(0)} rows={rows.you} />
          <Summary title="Campus" onEdit={() => go(1)} rows={rows.campus} />
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
              }}
              error={agreeError}
            />
          </div>
        </>
      ) : null}
    </StepFrame>
  );
}
