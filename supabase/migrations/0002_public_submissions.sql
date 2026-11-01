-- Store public advertisement and contact submissions in Supabase.
create table if not exists public.ad_requests (
  id uuid primary key default gen_random_uuid(),
  reference_no text not null unique,
  employer_name text not null,
  contact_person text not null,
  email text not null,
  phone text not null,
  job_title text not null,
  category_id text,
  location text not null,
  employment_type text,
  salary_info text,
  job_description text not null,
  responsibilities text,
  requirements text,
  experience_required text,
  application_deadline date,
  preferred_publish_date date,
  application_url text,
  poster_whatsapp text,
  poster_email text,
  brand_colors text,
  design_instructions text,
  additional_instructions text,
  terms_accepted boolean not null default false check (terms_accepted),
  has_poster boolean not null default false,
  status text not null default 'pending_review' check (status in ('pending_review','awaiting_payment','approved','in_progress','ready_to_publish','completed','rejected','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending_verification','paid','refunded','waived')),
  payment_reference text,
  payment_notes text,
  assigned_to_user_id uuid,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ad_requests_reference_format check (reference_no ~ '^JS-[0-9]{4}-[A-F0-9]{8}$')
);

create index if not exists ad_requests_created_at_idx on public.ad_requests (created_at desc);
create index if not exists ad_requests_status_idx on public.ad_requests (status, payment_status);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) between 1 and 120),
  email text not null check (length(trim(email)) between 3 and 320),
  phone text check (phone is null or length(phone) <= 40),
  subject text not null check (length(trim(subject)) between 1 and 200),
  message text not null check (length(trim(message)) between 1 and 10000),
  status text not null default 'unread' check (status in ('unread','read','replied','archived')),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);

alter table public.ad_requests enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can submit ad requests" on public.ad_requests;
create policy "Anyone can submit ad requests" on public.ad_requests
  for insert to anon, authenticated
  with check (terms_accepted = true and status = 'pending_review' and payment_status = 'unpaid'
    and payment_reference is null and payment_notes is null and assigned_to_user_id is null and internal_notes is null);

drop policy if exists "Admins can view ad requests" on public.ad_requests;
create policy "Admins can view ad requests" on public.ad_requests
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('admin','super_admin'));

drop policy if exists "Admins can update ad requests" on public.ad_requests;
create policy "Admins can update ad requests" on public.ad_requests
  for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('admin','super_admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('admin','super_admin'));

drop policy if exists "Anyone can submit contact messages" on public.contact_messages;
create policy "Anyone can submit contact messages" on public.contact_messages
  for insert to anon, authenticated
  with check (status = 'unread');

drop policy if exists "Admins can view contact messages" on public.contact_messages;
create policy "Admins can view contact messages" on public.contact_messages
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('admin','super_admin'));

drop policy if exists "Admins can update contact messages" on public.contact_messages;
create policy "Admins can update contact messages" on public.contact_messages
  for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('admin','super_admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('admin','super_admin'));

grant insert on public.ad_requests, public.contact_messages to anon, authenticated;
grant select, update on public.ad_requests, public.contact_messages to authenticated;

-- Expose only limited request status details to people who know the reference number.
create or replace function public.track_ad_request(p_reference_no text)
returns table (reference_no text, employer_name text, job_title text, status text, payment_status text, created_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select r.reference_no, r.employer_name, r.job_title, r.status, r.payment_status, r.created_at
  from public.ad_requests r
  where r.reference_no = upper(trim(p_reference_no))
  limit 1;
$$;
revoke all on function public.track_ad_request(text) from public;
grant execute on function public.track_ad_request(text) to anon, authenticated;
