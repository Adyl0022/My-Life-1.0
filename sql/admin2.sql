-- My Life 1.0 — admin page, part 2 (sales record, free codes, activate/revoke, confirm email).
-- Run once in Supabase > SQL Editor, after admin.sql.

alter table public.activation_codes add column if not exists price numeric(10,2);
alter table public.activation_codes add column if not exists method text;
alter table public.activation_codes add column if not exists free boolean not null default false;

drop function if exists public.admin_make_codes(int, text);
create or replace function public.admin_make_codes(p_count int, p_note text, p_price numeric, p_method text, p_free boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare made text[] := '{}'; c text; n int := greatest(1, least(coalesce(p_count, 1), 50)); f boolean := coalesce(p_free, false);
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
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
  if not public.is_admin() then raise exception 'not_admin'; end if;
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
  if not public.is_admin() then raise exception 'not_admin'; end if;
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
  if not public.is_admin() then raise exception 'not_admin'; end if;
  return coalesce((select jsonb_agg(x) from (
    select c.code, c.note, c.price, c.method, c.free, c.created_at, c.redeemed_at, u.email as used_by
    from public.activation_codes c left join auth.users u on u.id = c.redeemed_by
    order by c.created_at desc limit 100) x), '[]'::jsonb);
end $$;

-- Turn a person's access on (no code needed) or off. Their data stays saved while access is off.
create or replace function public.admin_set_license(p_user uuid, p_on boolean) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
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
  if not public.is_admin() then raise exception 'not_admin'; end if;
  update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where id = p_user;
  return true;
end $$;

grant execute on function public.admin_make_codes(int, text, numeric, text, boolean), public.admin_overview(), public.admin_users(), public.admin_codes(), public.admin_set_license(uuid, boolean), public.admin_confirm_email(uuid) to authenticated;
