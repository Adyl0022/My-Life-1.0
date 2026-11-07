-- My Life 1.0 — admin extras. Run once in Supabase > SQL Editor, after admin3.sql.
-- Adds: growth graph, delete unused codes, in-app announcement, feedback inbox, wrong-code log.

-- 1. Growth: sign-ups per day (last 14 days) and people who signed in during the last 7 days.
create or replace function public.admin_growth() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_guard();
  return jsonb_build_object(
    'days', coalesce((select jsonb_agg(jsonb_build_object('d', to_char(g.d, 'YYYY-MM-DD'), 'n', coalesce(c.n, 0)) order by g.d)
      from generate_series(current_date - 13, current_date, interval '1 day') g(d)
      left join (select created_at::date as d, count(*) as n from auth.users group by 1) c on c.d = g.d::date), '[]'::jsonb),
    'active7', (select count(*) from auth.users where last_sign_in_at > now() - interval '7 days'));
end $$;

-- 2. Delete a code that nobody has used yet.
create or replace function public.admin_delete_code(p_code text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_guard();
  delete from public.activation_codes where code = p_code and redeemed_by is null;
  return found;
end $$;

-- 3. Announcement shown to every signed-in user on the Dashboard.
create table if not exists public.announcements (
  id bigserial primary key,
  msg text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.announcements enable row level security;   -- no policies: only the functions below can touch it

create or replace function public.get_announcement() returns jsonb
language sql security definer set search_path = public stable as $$
  select (select jsonb_build_object('id', a.id, 'msg', a.msg) from public.announcements a where a.active order by a.id desc limit 1);
$$;
grant execute on function public.get_announcement() to authenticated;

create or replace function public.admin_announce(p_msg text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_guard();
  update public.announcements set active = false where active;
  if length(trim(coalesce(p_msg, ''))) > 0 then
    insert into public.announcements(msg) values (left(trim(p_msg), 300));
  end if;
  return true;
end $$;

-- 4. Feedback from users (they send it from Settings).
create table if not exists public.feedback (
  id bigserial primary key,
  user_id uuid not null,
  email text,
  msg text not null,
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;

create or replace function public.send_feedback(p_msg text) returns boolean
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if length(trim(coalesce(p_msg, ''))) = 0 then return false; end if;
  if (select count(*) from public.feedback where user_id = uid and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'too_many_attempts';
  end if;
  insert into public.feedback(user_id, email, msg)
    values (uid, (select email from auth.users where id = uid), left(trim(p_msg), 1000));
  return true;
end $$;
grant execute on function public.send_feedback(text) to authenticated;

create or replace function public.admin_feedback() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_guard();
  return coalesce((select jsonb_agg(x) from (select id, email, msg, created_at from public.feedback order by id desc limit 100) x), '[]'::jsonb);
end $$;

create or replace function public.admin_feedback_delete(p_id bigint) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_guard();
  delete from public.feedback where id = p_id;
  return true;
end $$;

-- 5. Wrong activation codes: keep the tries for 30 days instead of 1 day (the 8-tries-per-15-minutes limit is unchanged).
create or replace function public.redeem_code(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  c public.activation_codes;
  cur timestamptz;
  newexp timestamptz;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  delete from public.code_attempts where at < now() - interval '30 days';
  if (select count(*) from public.code_attempts where user_id = uid and at > now() - interval '15 minutes') >= 8 then
    raise exception 'too_many_attempts';
  end if;
  select * into c from public.activation_codes
    where code = upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g')) and redeemed_by is null
    for update;
  if not found then
    insert into public.code_attempts(user_id) values (uid);
    return jsonb_build_object('error', 'invalid_code');
  end if;
  update public.activation_codes set redeemed_by = uid, redeemed_at = now() where code = c.code;
  select expires_at into cur from public.licenses where user_id = uid;
  if c.days is null then newexp := null;
  else newexp := greatest(coalesce(cur, now()), now()) + (c.days || ' days')::interval;
    if exists (select 1 from public.licenses where user_id = uid and expires_at is null) then newexp := null; end if;
  end if;
  insert into public.licenses(user_id, activated_at, expires_at) values (uid, now(), newexp)
    on conflict (user_id) do update set expires_at = excluded.expires_at;
  return jsonb_build_object('active', true, 'expires_at', newexp);
end $$;

create or replace function public.admin_attempts() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_guard();
  return coalesce((select jsonb_agg(x) from (
    select u.email, count(*) as tries, count(*) filter (where a.at > now() - interval '24 hours') as tries_24h, max(a.at) as last_at
    from public.code_attempts a join auth.users u on u.id = a.user_id
    group by u.email order by max(a.at) desc limit 50) x), '[]'::jsonb);
end $$;

grant execute on function public.admin_growth() to authenticated;
grant execute on function public.admin_delete_code(text) to authenticated;
grant execute on function public.admin_announce(text) to authenticated;
grant execute on function public.admin_feedback() to authenticated;
grant execute on function public.admin_feedback_delete(bigint) to authenticated;
grant execute on function public.admin_attempts() to authenticated;
