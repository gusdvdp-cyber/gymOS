-- Add push_token column to profiles for Expo push notifications
alter table public.profiles
  add column if not exists push_token text;

-- Index for quick lookups when sending bulk notifications
create index if not exists profiles_push_token_idx
  on public.profiles (push_token)
  where push_token is not null;
