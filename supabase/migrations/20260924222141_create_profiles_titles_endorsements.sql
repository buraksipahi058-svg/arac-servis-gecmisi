-- Kullanıcı profilleri, unvanlar ve unvan onayları
-- (Proje sahibinin kapsam kararı, 25.09.2026 — bkz. CLAUDE.md.)
--
-- Unvanlar kullanıcının kendi beyanıdır; onaylar diğer kullanıcılar tarafından verilir.
-- Uygulama unvanları doğrulamaz, yalnızca kimin onayladığını gösterir.
-- Profiller giriş yapmış kullanıcılara açıktır; anonim erişim ve paylaşım görünümü dışındadır.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  display_name text not null,
  city text,
  phone text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_display_name_length check (char_length(btrim(display_name)) between 2 and 60),
  constraint profiles_city_length check (city is null or char_length(city) between 2 and 40),
  constraint profiles_phone_format check (phone is null or phone ~ '^\+?[0-9 ()-]{7,20}$'),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 500)
);

comment on table public.profiles is
  'Kullanıcının herkese (giriş yapmış kullanıcılara) açık profili. E-posta burada tutulmaz.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (display_name, city, phone, bio) on table public.profiles to authenticated;
grant update (display_name, city, phone, bio) on table public.profiles to authenticated;

alter table public.profiles enable row level security;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- profile_titles: kullanıcının kendi seçtiği unvanlar (birden fazla olabilir)
-- ---------------------------------------------------------------------------
create table public.profile_titles (
  user_id uuid not null default auth.uid() references public.profiles (user_id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),

  primary key (user_id, title),
  constraint profile_titles_title_values check (title in ('seller', 'authorized_service', 'mechanic'))
);

comment on column public.profile_titles.title is
  'seller: satıcı, authorized_service: yetkili servis, mechanic: usta (kullanıcının kendi beyanı)';

revoke all on table public.profile_titles from anon, authenticated;
grant select, delete on table public.profile_titles to authenticated;
grant insert (title) on table public.profile_titles to authenticated;

alter table public.profile_titles enable row level security;

create policy "profile_titles_select_authenticated"
  on public.profile_titles for select
  to authenticated
  using (true);

create policy "profile_titles_insert_own"
  on public.profile_titles for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "profile_titles_delete_own"
  on public.profile_titles for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- title_endorsements: bir kullanıcının başka bir kullanıcının unvanını onaylaması
-- ---------------------------------------------------------------------------
create table public.title_endorsements (
  holder_id uuid not null,
  title text not null,
  -- Onaylayanın profili olmalı (onay listesinde adı gösterilir).
  endorser_id uuid not null default auth.uid() references public.profiles (user_id) on delete cascade,
  created_at timestamptz not null default now(),

  -- Aynı kişi aynı unvanı bir kez onaylayabilir.
  primary key (holder_id, title, endorser_id),
  -- Unvan kaldırılırsa ona verilen onaylar da silinir.
  foreign key (holder_id, title) references public.profile_titles (user_id, title) on delete cascade,
  constraint title_endorsements_not_self check (holder_id <> endorser_id)
);

create index title_endorsements_endorser_idx
  on public.title_endorsements (endorser_id, created_at desc);

revoke all on table public.title_endorsements from anon, authenticated;
grant select, delete on table public.title_endorsements to authenticated;
-- endorser_id istemciden yazılamaz; auth.uid() ile dolar.
grant insert (holder_id, title) on table public.title_endorsements to authenticated;

alter table public.title_endorsements enable row level security;

create policy "title_endorsements_select_authenticated"
  on public.title_endorsements for select
  to authenticated
  using (true);

create policy "title_endorsements_insert_own"
  on public.title_endorsements for insert
  to authenticated
  with check (endorser_id = (select auth.uid()));

create policy "title_endorsements_delete_own"
  on public.title_endorsements for delete
  to authenticated
  using (endorser_id = (select auth.uid()));
