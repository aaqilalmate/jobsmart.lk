-- Jobsmart.lk job directory. No sample vacancies are inserted.
create table if not exists public.job_categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  icon text not null default 'Briefcase',
  display_order integer not null default 0
);

create table if not exists public.locations (
  id text primary key,
  name text not null,
  slug text not null unique,
  province text not null,
  display_order integer not null default 0
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  company_name text not null,
  company_logo_url text,
  category_id text not null references public.job_categories(id),
  location_id text not null references public.locations(id),
  employment_type text not null check (employment_type in ('Full-Time','Part-Time','Contract','Internship','Temporary')),
  workplace_type text not null check (workplace_type in ('On-site','Remote','Hybrid')),
  salary_min integer,
  salary_max integer,
  salary_currency text not null default 'LKR',
  salary_visible boolean not null default true,
  description text not null,
  responsibilities text not null default '',
  requirements text not null default '',
  experience_level text not null default '',
  application_method text not null check (application_method in ('portal','whatsapp','email','mixed')),
  career_url text,
  whatsapp_number text,
  contact_email text,
  external_instructions text,
  deadline date,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','expired','archived')),
  views_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_public_listing_idx on public.jobs(status, published_at desc);
create index if not exists jobs_category_idx on public.jobs(category_id);
create index if not exists jobs_location_idx on public.jobs(location_id);

insert into public.job_categories (id,name,slug,icon,display_order) values
('cat_it','Software & IT','software-it','Code2',1),('cat_banking','Banking & Finance','banking-finance','Landmark',2),
('cat_marketing','Marketing & Sales','marketing-sales','TrendingUp',3),('cat_accounting','Accounting & Auditing','accounting-auditing','Calculator',4),
('cat_logistics','Logistics & Supply Chain','logistics-supply-chain','Truck',5),('cat_support','Customer Service & BPO','customer-service-bpo','Headphones',6),
('cat_tourism','Hospitality & Tourism','hospitality-tourism','Hotel',7),('cat_engineering','Engineering & Construction','engineering-construction','Wrench',8),
('cat_healthcare','Healthcare & Medical','healthcare-medical','Stethoscope',9),('cat_management','HR & Administration','hr-administration','Users',10)
on conflict (id) do nothing;

insert into public.locations (id,name,slug,province,display_order) values
('loc_colombo','Colombo','colombo','Western Province',1),('loc_gampaha','Gampaha','gampaha','Western Province',2),('loc_kalutara','Kalutara','kalutara','Western Province',3),
('loc_kandy','Kandy','kandy','Central Province',4),('loc_matale','Matale','matale','Central Province',5),('loc_nuwara_eliya','Nuwara Eliya','nuwara-eliya','Central Province',6),
('loc_galle','Galle','galle','Southern Province',7),('loc_matara','Matara','matara','Southern Province',8),('loc_hambantota','Hambantota','hambantota','Southern Province',9),
('loc_jaffna','Jaffna','jaffna','Northern Province',10),('loc_kilinochchi','Kilinochchi','kilinochchi','Northern Province',11),('loc_mannar','Mannar','mannar','Northern Province',12),('loc_vavuniya','Vavuniya','vavuniya','Northern Province',13),('loc_mullaitivu','Mullaitivu','mullaitivu','Northern Province',14),
('loc_batticaloa','Batticaloa','batticaloa','Eastern Province',15),('loc_ampara','Ampara','ampara','Eastern Province',16),('loc_trincomalee','Trincomalee','trincomalee','Eastern Province',17),
('loc_kurunegala','Kurunegala','kurunegala','North Western Province',18),('loc_puttalam','Puttalam','puttalam','North Western Province',19),
('loc_anuradhapura','Anuradhapura','anuradhapura','North Central Province',20),('loc_polonnaruwa','Polonnaruwa','polonnaruwa','North Central Province',21),
('loc_badulla','Badulla','badulla','Uva Province',22),('loc_monaragala','Monaragala','monaragala','Uva Province',23),
('loc_ratnapura','Ratnapura','ratnapura','Sabaragamuwa Province',24),('loc_kegalle','Kegalle','kegalle','Sabaragamuwa Province',25)
on conflict (id) do nothing;

alter table public.job_categories enable row level security;
alter table public.locations enable row level security;
alter table public.jobs enable row level security;

drop policy if exists "Categories and locations are readable by everyone" on public.job_categories;
drop policy if exists "Locations are readable by everyone" on public.locations;
drop policy if exists "Published jobs are public; admins can read all" on public.jobs;
drop policy if exists "Only Supabase admins can create jobs" on public.jobs;
drop policy if exists "Only Supabase admins can edit jobs" on public.jobs;
drop policy if exists "Only Supabase admins can delete jobs" on public.jobs;
create policy "Categories and locations are readable by everyone" on public.job_categories
  for select to anon, authenticated using (true);
create policy "Locations are readable by everyone" on public.locations
  for select to anon, authenticated using (true);
create policy "Published jobs are public; admins can read all" on public.jobs
  for select to anon, authenticated
  using (status = 'published' or (auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('admin','super_admin'));
create policy "Only Supabase admins can create jobs" on public.jobs
  for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('admin','super_admin'));
create policy "Only Supabase admins can edit jobs" on public.jobs
  for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('admin','super_admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('admin','super_admin'));
create policy "Only Supabase admins can delete jobs" on public.jobs
  for delete to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('admin','super_admin'));

grant select on public.job_categories, public.locations to anon, authenticated;
grant select on public.jobs to anon, authenticated;
grant insert, update, delete on public.jobs to authenticated;

-- Publicly deliver the site's existing static images; only admins may manage files.
insert into storage.buckets (id, name, public)
values ('jobsmart-assets', 'jobsmart-assets', true)
on conflict (id) do nothing;

-- Public buckets serve known object URLs without granting clients permission
-- to list every stored file.
drop policy if exists "Jobsmart assets are publicly readable" on storage.objects;
drop policy if exists "Only Supabase admins can upload Jobsmart assets" on storage.objects;
drop policy if exists "Only Supabase admins can update Jobsmart assets" on storage.objects;
drop policy if exists "Only Supabase admins can delete Jobsmart assets" on storage.objects;
create policy "Only Supabase admins can upload Jobsmart assets" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'jobsmart-assets' and (auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('admin','super_admin'));
create policy "Only Supabase admins can update Jobsmart assets" on storage.objects
  for update to authenticated
  using (bucket_id = 'jobsmart-assets' and (auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('admin','super_admin'))
  with check (bucket_id = 'jobsmart-assets' and (auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('admin','super_admin'));
create policy "Only Supabase admins can delete Jobsmart assets" on storage.objects
  for delete to authenticated
  using (bucket_id = 'jobsmart-assets' and (auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('admin','super_admin'));

-- Populate the admin_role claim in Auth user app_metadata via a trusted Admin API call
-- or the Supabase Dashboard. Allowed values: admin or super_admin. Never use user_metadata.
