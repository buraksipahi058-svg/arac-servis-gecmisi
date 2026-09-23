-- vehicles tablosu için yetki ve RLS testleri.
-- Çalıştırma: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;

select plan(16);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'owner-a@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'user-b@test.local');

-- A'nın bilinen ID'li aracı (yetkili rol ile hazırlanır).
insert into public.vehicles (id, owner_id, plate, make, model, model_year) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '34ABC123', 'Toyota', 'Corolla', 2021);

select is(
  (select relrowsecurity from pg_class where oid = 'public.vehicles'::regclass),
  true,
  'vehicles tablosunda RLS açık'
);
select has_trigger('public', 'vehicles', 'vehicles_set_updated_at', 'updated_at trigger tanımlı');

-- ---------- Kullanıcı A ----------
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.vehicles (plate, make, model, model_year) values ('06DEF45', 'Renault', 'Clio', 2018) $$,
  'A kendi aracını ekleyebilir'
);
select is(
  (select owner_id from public.vehicles where plate = '06DEF45'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'owner_id otomatik olarak auth.uid() olur'
);
select throws_ok(
  $$ insert into public.vehicles (owner_id, plate, make, model, model_year)
     values ('22222222-2222-2222-2222-222222222222', '06XYZ99', 'Fiat', 'Egea', 2020) $$,
  '42501',
  null,
  'owner_id istemciden verilemez (başkası adına araç eklenemez)'
);
select throws_ok(
  $$ insert into public.vehicles (plate, make, model, model_year) values ('34ABC123', 'Toyota', 'Corolla', 2021) $$,
  '23505',
  null,
  'aynı kullanıcı aynı plakayı iki kez ekleyemez'
);
select throws_ok(
  $$ insert into public.vehicles (plate, make, model, model_year) values ('99 abc 1', 'Toyota', 'Corolla', 2021) $$,
  '23514',
  null,
  'geçersiz plaka biçimi reddedilir'
);

-- ---------- Kullanıcı B ----------
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select count(*) from public.vehicles),
  0::bigint,
  'B, A''nın aracını göremez'
);
select is(
  (select count(*) from public.vehicles where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  0::bigint,
  'B, ID ile de A''nın aracına ulaşamaz'
);

update public.vehicles set make = 'Degistirildi' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
delete from public.vehicles where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

select lives_ok(
  $$ insert into public.vehicles (plate, make, model, model_year) values ('34ABC123', 'Honda', 'Civic', 2019) $$,
  'B aynı plakayı kendi hesabına ekleyebilir (plaka varlığı sızdırılmaz)'
);
select throws_ok(
  $$ update public.vehicles set owner_id = '11111111-1111-1111-1111-111111111111' $$,
  '42501',
  null,
  'owner_id sonradan değiştirilemez'
);
select throws_ok(
  $$ update public.vehicles set created_at = now() - interval '1 year' $$,
  '42501',
  null,
  'created_at istemciden değiştirilemez'
);

-- ---------- Anonim ----------
reset role;
set local role anon;
set local request.jwt.claims = '{"role": "anon"}';

select throws_ok(
  $$ select * from public.vehicles $$,
  '42501',
  null,
  'anonim kullanıcı araç tablosunu okuyamaz'
);

-- ---------- Tekrar A: B'nin girişimleri etkisiz kalmış olmalı ----------
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select is(
  (select make from public.vehicles where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  'Toyota',
  'B''nin güncelleme denemesi A''nın aracını değiştirmedi'
);
select is(
  (select count(*) from public.vehicles),
  2::bigint,
  'B''nin silme denemesi A''nın aracını silmedi; A yalnızca kendi aracını görür'
);
select lives_ok(
  $$ delete from public.vehicles where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  'A kendi aracını silebilir'
);

select * from finish();
rollback;
