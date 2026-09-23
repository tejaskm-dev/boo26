-- BOO! 2026 — registration
--
-- Paste this into Supabase → SQL Editor → Run. It's safe to run again: every
-- statement checks first.
--
-- Two tables. A team has a code and a name; a member holds one of its two
-- seats. The rules the sign-up promises are kept by the database itself, so
-- two people registering at the same instant can't get past them:
--
--   * one team per name                   unique index on the lowered name
--   * one person per email/number/ID      unique indexes on the three
--   * two seats per team, never three     seat is 1 or 2, unique per team
--
-- Nothing can read this but the site's server: row level security is on and
-- no policy grants anyone anything, which leaves only the service role key
-- (SUPABASE_SERVICE_ROLE_KEY) able to touch it. Keep that key server-side.

create table if not exists public.teams (
  code text primary key,
  name text not null,
  name_key text generated always as (lower(btrim(name))) stored,
  reaction text not null default '',
  created_at timestamptz not null default now()
);

create unique index if not exists teams_name_key_idx on public.teams (name_key);

create table if not exists public.members (
  id bigint generated always as identity primary key,
  team_code text not null references public.teams (code) on delete cascade,
  seat smallint not null check (seat in (1, 2)),
  name text not null,
  email text not null,
  phone text not null,
  college_id text not null,
  department text not null,
  year text not null,
  created_at timestamptz not null default now(),
  unique (team_code, seat)
);

create unique index if not exists members_email_idx on public.members (lower(email));
create unique index if not exists members_phone_idx on public.members (phone);
create unique index if not exists members_college_id_idx on public.members (upper(college_id));

alter table public.teams enable row level security;
alter table public.members enable row level security;

-- Which of this person's details someone has already registered with.
create or replace function public.member_clashes(p jsonb)
returns text[]
language sql
stable
as $$
  select coalesce(array_agg(taken), '{}'::text[])
  from (
    select 'email'::text as taken where exists (
      select 1 from public.members m where lower(m.email) = lower(p->>'email')
    )
    union all
    select 'phone'::text where exists (
      select 1 from public.members m where m.phone = p->>'phone'
    )
    union all
    select 'college_id'::text where exists (
      select 1 from public.members m where upper(m.college_id) = upper(p->>'college_id')
    )
  ) t;
$$;

-- Starts a team with the person who went first. The code comes from the site,
-- which tries another one if this says 'retry'.
create or replace function public.register_team(p_code text, p_name text, p_reaction text, p_member jsonb)
returns jsonb
language plpgsql
as $$
declare
  v_clashes text[];
begin
  v_clashes := public.member_clashes(p_member);
  if exists (select 1 from public.teams t where t.name_key = lower(btrim(p_name))) then
    v_clashes := array_prepend('team_name', v_clashes);
  end if;
  if array_length(v_clashes, 1) > 0 then
    return jsonb_build_object('ok', false, 'clashes', to_jsonb(v_clashes));
  end if;

  insert into public.teams (code, name, reaction)
  values (p_code, btrim(p_name), coalesce(p_reaction, ''));

  insert into public.members (team_code, seat, name, email, phone, college_id, department, year)
  values (
    p_code, 1,
    p_member->>'name', p_member->>'email', p_member->>'phone',
    p_member->>'college_id', p_member->>'department', p_member->>'year'
  );

  return jsonb_build_object('ok', true, 'code', p_code);
exception
  when unique_violation then
    -- someone got there in the same instant, or the code is taken: ask again
    return jsonb_build_object('ok', false, 'clashes', to_jsonb(array['retry']));
end;
$$;

-- Puts the second person on a team, if the seat is still free.
create or replace function public.join_team(p_code text, p_member jsonb)
returns jsonb
language plpgsql
as $$
declare
  v_clashes text[];
begin
  if not exists (select 1 from public.teams t where t.code = p_code) then
    return jsonb_build_object('ok', false, 'reason', 'missing');
  end if;
  if (select count(*) from public.members m where m.team_code = p_code) >= 2 then
    return jsonb_build_object('ok', false, 'reason', 'full');
  end if;

  v_clashes := public.member_clashes(p_member);
  if array_length(v_clashes, 1) > 0 then
    return jsonb_build_object('ok', false, 'clashes', to_jsonb(v_clashes));
  end if;

  insert into public.members (team_code, seat, name, email, phone, college_id, department, year)
  values (
    p_code, 2,
    p_member->>'name', p_member->>'email', p_member->>'phone',
    p_member->>'college_id', p_member->>'department', p_member->>'year'
  );

  return jsonb_build_object('ok', true, 'code', p_code);
exception
  when unique_violation then
    -- the second seat, or one of these details, went a moment ago
    if exists (select 1 from public.members m where m.team_code = p_code and m.seat = 2) then
      return jsonb_build_object('ok', false, 'reason', 'full');
    end if;
    return jsonb_build_object('ok', false, 'clashes', to_jsonb(public.member_clashes(p_member)));
end;
$$;

-- Who changed what in the dashboard: removing a team, freeing a seat.
create table if not exists public.admin_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  who text not null,
  did text not null,
  about text not null
);

alter table public.admin_log enable row level security;

-- What the night needs, in one place: every registered person with their team.
-- security_invoker, so it's read with the rights of whoever asks rather than
-- the rights of whoever made it: without it a view owned here would hand the
-- public API key every student's email and number, straight past the row
-- level security above.
create or replace view public.registrations with (security_invoker = on) as
  select
    t.code as team_code,
    t.name as team_name,
    t.reaction,
    m.seat,
    m.name,
    m.email,
    m.phone,
    m.college_id,
    m.department,
    m.year,
    m.created_at
  from public.members m
  join public.teams t on t.code = m.team_code
  order by t.created_at, m.seat;

-- Only the site's server has any business here. The tables are already closed
-- by row level security; this takes the public keys off the view and the two
-- functions that write, so nothing is left to try.
revoke all on public.registrations from anon, authenticated;
revoke all on public.teams, public.members, public.admin_log from anon, authenticated;
revoke execute on function public.register_team(text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.join_team(text, jsonb) from public, anon, authenticated;
revoke execute on function public.member_clashes(jsonb) from public, anon, authenticated;
