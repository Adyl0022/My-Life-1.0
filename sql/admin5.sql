-- My Life 1.0 — admin can give a user a temporary password (for people whose reset email never arrives).
-- Run once in Supabase > SQL Editor, after admin4.sql.
create or replace function public.admin_reset_password(p_user uuid) returns text
language plpgsql security definer set search_path = public as $$
declare h text; pw text;
begin
  perform public.admin_guard();
  h := encode(extensions.gen_random_bytes(6), 'hex');
  pw := 'Ml-' || substr(h, 1, 4) || '-' || substr(h, 5, 4) || '-' || substr(h, 9, 4);
  update auth.users set encrypted_password = extensions.crypt(pw, extensions.gen_salt('bf')), updated_at = now() where id = p_user;
  if not found then raise exception 'no_such_user'; end if;
  delete from auth.sessions where user_id = p_user;   -- sign them out everywhere
  return pw;
end $$;
grant execute on function public.admin_reset_password(uuid) to authenticated;
