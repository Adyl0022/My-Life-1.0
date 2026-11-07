-- My Life 1.0 — admin code. Run once in Supabase > SQL Editor, after admin.sql and admin2.sql.
-- Every admin action now also needs the secret code (checked here on the server, valid for 15 minutes).

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.admin_secret (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pin_hash text not null,
  set_at timestamptz not null default now()
);
alter table public.admin_secret enable row level security;   -- no policies: the app can never read it

create table if not exists public.admin_session (
  user_id uuid primary key references auth.users(id) on delete cascade,
  until timestamptz,
  fails int not null default 0,
  locked_until timestamptz
);
alter table public.admin_session enable row level security;

create or replace function public.admin_guard() returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  if not exists (select 1 from public.admin_session where user_id = auth.uid() and until > now()) then raise exception 'admin_locked'; end if;
end $$;

create or replace function public.admin_pin_status() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  return jsonb_build_object(
    'has_pin', exists (select 1 from public.admin_secret where user_id = auth.uid()),
    'unlocked', exists (select 1 from public.admin_session where user_id = auth.uid() and until > now()),
    'locked_seconds', coalesce((select greatest(0, extract(epoch from locked_until - now()))::int from public.admin_session where user_id = auth.uid()), 0));
end $$;

create or replace function public.admin_unlock(p_pin text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare s public.admin_secret; r public.admin_session;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  select * into r from public.admin_session where user_id = auth.uid();
  if found and r.locked_until is not null and r.locked_until > now() then
    return jsonb_build_object('error', 'locked', 'seconds', extract(epoch from r.locked_until - now())::int);
  end if;
  select * into s from public.admin_secret where user_id = auth.uid();
  if not found then return jsonb_build_object('error', 'no_pin'); end if;
  if s.pin_hash = crypt(coalesce(p_pin, ''), s.pin_hash) then
    insert into public.admin_session(user_id, until, fails, locked_until) values (auth.uid(), now() + interval '15 minutes', 0, null)
      on conflict (user_id) do update set until = excluded.until, fails = 0, locked_until = null;
    return jsonb_build_object('ok', true);
  end if;
  -- wrong code: count it (returned, not raised, so the count is really saved)
  insert into public.admin_session(user_id, until, fails) values (auth.uid(), null, 1)
    on conflict (user_id) do update set fails = public.admin_session.fails + 1, until = null;
  update public.admin_session set locked_until = case when fails >= 5 then now() + interval '15 minutes' else null end,
         fails = case when fails >= 5 then 0 else fails end where user_id = auth.uid();
  select * into r from public.admin_session where user_id = auth.uid();
  if r.locked_until is not null and r.locked_until > now() then return jsonb_build_object('error', 'locked', 'seconds', 900); end if;
  return jsonb_build_object('error', 'wrong', 'tries_left', greatest(0, 5 - r.fails));
end $$;

create or replace function public.admin_set_pin(p_pin text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  if coalesce(p_pin, '') !~ '^[0-9]{6}$' then return jsonb_build_object('error', 'bad_pin'); end if;
  if exists (select 1 from public.admin_secret where user_id = auth.uid()) then perform public.admin_guard(); end if;   -- changing it needs the current code first
  insert into public.admin_secret(user_id, pin_hash) values (auth.uid(), crypt(p_pin, gen_salt('bf')))
    on conflict (user_id) do update set pin_hash = excluded.pin_hash, set_at = now();
  insert into public.admin_session(user_id, until, fails, locked_until) values (auth.uid(), now() + interval '15 minutes', 0, null)
    on conflict (user_id) do update set until = excluded.until, fails = 0, locked_until = null;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.admin_lock() returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  update public.admin_session set until = null where user_id = auth.uid();
  return true;
end $$;

-- The admin actions, now behind the code:
drop function if exists public.admin_make_codes(int, text);
create or replace function public.admin_make_codes(p_count int, p_note text, p_price numeric, p_method text, p_free boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare made text[] := '{}'; c text; n int := greatest(1, least(coalesce(p_count, 1), 50)); f boolean := coalesce(p_free, false);
begin
  perform public.admin_guard();
  while coalesce(array_length(made, 1), 0) < n loop
    c := 'ML-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)) || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
    insert into public.activation_codes(code, note, price, method, free)
      values (c, nullif(trim(p_note), ''), case when f then 0 else p_price end, case when f then 'Free' else nullif(trim(p_method), '') end, f)
      on conflict do nothing;
    if found then made := made || c; end if;
  end loop;
  return to_jsonb(made);
end $$;

create or replace function public.admin_overview() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_guard();
  return jsonb_build_object(
    'users', (select count(*) from auth.users),
    'active', (select count(*) from public.licenses where expires_at is null or expires_at > now()),
    'new_7d', (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'codes_unused', (select count(*) from public.activation_codes where redeemed_by is null),
    'codes_used', (select count(*) from public.activation_codes where redeemed_by is not null),
    'income', (select coalesce(sum(price), 0) from public.activation_codes where not free),
    'income_month', (select coalesce(sum(price), 0) from public.activation_codes where not free and created_at >= date_trunc('month', now())),
    'sold_month', (select count(*) from public.activation_codes where not free and created_at >= date_trunc('month', now())),
    'free_total', (select count(*) from public.activation_codes where free));
end $$;

create or replace function public.admin_users() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_guard();
  return coalesce((select jsonb_agg(x) from (
    select u.id, u.email, u.raw_user_meta_data->>'name' as name, u.created_at, u.last_sign_in_at,
           (u.email_confirmed_at is not null) as confirmed,
           (l.user_id is not null and (l.expires_at is null or l.expires_at > now())) as active
    from auth.users u left join public.licenses l on l.user_id = u.id
    order by u.created_at desc limit 500) x), '[]'::jsonb);
end $$;

create or replace function public.admin_codes() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_guard();
  return coalesce((select jsonb_agg(x) from (
    select c.code, c.note, c.price, c.method, c.free, c.created_at, c.redeemed_at, u.email as used_by
    from public.activation_codes c left join auth.users u on u.id = c.redeemed_by
    order by c.created_at desc limit 100) x), '[]'::jsonb);
end $$;

-- Turn a person's access on (no code needed) or off. Their data stays saved while access is off.
create or replace function public.admin_set_license(p_user uuid, p_on boolean) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_guard();
  if p_on then
    insert into public.licenses(user_id, expires_at) values (p_user, null)
      on conflict (user_id) do update set expires_at = null;
  else
    if p_user = auth.uid() then raise exception 'cannot_revoke_self'; end if;
    delete from public.licenses where user_id = p_user;
  end if;
  return true;
end $$;

-- For someone whose confirmation email never arrived.
create or replace function public.admin_confirm_email(p_user uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_guard();
  update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where id = p_user;
  return true;
end $$;


grant execute on function public.admin_guard(), public.admin_pin_status(), public.admin_unlock(text), public.admin_set_pin(text), public.admin_lock(),
  public.admin_make_codes(int, text, numeric, text, boolean), public.admin_overview(), public.admin_users(), public.admin_codes(), public.admin_set_license(uuid, boolean), public.admin_confirm_email(uuid) to authenticated;

-- If you ever forget the code, run this, then open Admin in the app and set a new one:
-- delete from public.admin_secret; delete from public.admin_session;
