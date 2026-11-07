-- My Life 1.0 — admin page. Run once in Supabase > SQL Editor (after license.sql).

create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admins enable row level security;   -- no policies: nobody can read or change it from the app

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.admin_overview() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  return jsonb_build_object(
    'users', (select count(*) from auth.users),
    'active', (select count(*) from public.licenses where expires_at is null or expires_at > now()),
    'codes_unused', (select count(*) from public.activation_codes where redeemed_by is null),
    'codes_used', (select count(*) from public.activation_codes where redeemed_by is not null),
    'new_7d', (select count(*) from auth.users where created_at > now() - interval '7 days'));
end $$;

create or replace function public.admin_users() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  return coalesce((select jsonb_agg(x) from (
    select u.email, u.raw_user_meta_data->>'name' as name, u.created_at, u.last_sign_in_at,
           (l.user_id is not null and (l.expires_at is null or l.expires_at > now())) as active
    from auth.users u left join public.licenses l on l.user_id = u.id
    order by u.created_at desc limit 200) x), '[]'::jsonb);
end $$;

create or replace function public.admin_codes() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  return coalesce((select jsonb_agg(x) from (
    select c.code, c.note, c.created_at, c.redeemed_at, u.email as used_by
    from public.activation_codes c left join auth.users u on u.id = c.redeemed_by
    order by c.created_at desc limit 50) x), '[]'::jsonb);
end $$;

create or replace function public.admin_make_codes(p_count int, p_note text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare made text[] := '{}'; c text; n int := greatest(1, least(coalesce(p_count, 1), 50));
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  while coalesce(array_length(made, 1), 0) < n loop
    c := 'ML-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)) || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
    insert into public.activation_codes(code, note) values (c, nullif(trim(p_note), '')) on conflict do nothing;
    if found then made := made || c; end if;
  end loop;
  return to_jsonb(made);
end $$;

grant execute on function public.is_admin(), public.admin_overview(), public.admin_users(), public.admin_codes(), public.admin_make_codes(int, text) to authenticated;

-- Make your own account the admin (change the email if needed):
insert into public.admins(user_id) select id from auth.users where email = 'adlisyahmi324@gmail.com' on conflict do nothing;
