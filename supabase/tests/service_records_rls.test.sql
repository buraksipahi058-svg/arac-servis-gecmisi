-- service_records, service_record_audits ve services için yetki, RLS ve audit testleri.
-- Çalıştırma: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;

select plan(24);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'owner-a@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'user-b@test.local');

insert into public.vehicles (id, owner_id, plate, make, model, model_year) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '34ABC123', 'Toyota', 'Corolla', 2021),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '06DEF45', 'Renault', 'Clio', 2018);

-- Servis tarafından girilmiş bir kayıt (yalnızca yetkili rol oluşturabilir).
insert into public.service_records (id, vehicle_id, service_name, service_date, odometer_km, description, entered_by) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Yetkili Servis', '2024-01-10', 40000, 'Periyodik bakım', 'service');

select is(
  (select bool_and(relrowsecurity) from pg_class
   where oid in ('public.services'::regclass, 'public.service_records'::regclass, 'public.service_record_audits'::regclass)),
  true,
  'services, service_records ve service_record_audits tablolarında RLS açık'
);

-- ---------- Kullanıcı A ----------
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.service_records (vehicle_id, service_name, service_date, odometer_km, description)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ABC Oto', '2025-03-12', 58700, 'Motor yağı ve filtre değişti') $$,
  'A kendi aracına kayıt ekleyebilir'
);
select is(
  (select entered_by from public.service_records where odometer_km = 58700),
  'owner',
  'entered_by varsayılan olarak owner olur'
);
select throws_ok(
  $$ insert into public.service_records (vehicle_id, service_name, service_date, odometer_km, description, entered_by)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sahte', '2025-01-01', 1, 'x', 'service') $$,
  '42501', null,
  'A kaydı "servis tarafından girildi" olarak işaretleyemez'
);
select throws_ok(
  $$ insert into public.service_records (vehicle_id, service_name, service_date, odometer_km, description)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ABC Oto', '2025-01-01', 1000, 'x') $$,
  '42501', null,
  'A, B''nin aracına kayıt ekleyemez'
);
select is(
  (select count(*) from public.service_records),
  2::bigint,
  'A yalnızca kendi aracının kayıtlarını görür'
);
select is(
  (select count(*) from public.service_record_audits where action = 'insert'),
  2::bigint,
  'her ekleme audit tablosuna yazılır'
);

-- Düzenleme ve audit
update public.service_records set odometer_km = 58800, description = 'Motor yağı, yağ filtresi değişti'
  where id = (select id from public.service_records where service_name = 'ABC Oto');

select is(
  (select old_values from public.service_record_audits
   where record_id = (select id from public.service_records where service_name = 'ABC Oto') and action = 'update'),
  '{"odometer_km": 58700, "description": "Motor yağı ve filtre değişti"}'::jsonb,
  'audit önceki değerleri (yalnızca değişen alanlar) saklar'
);
select is(
  (select new_values from public.service_record_audits
   where record_id = (select id from public.service_records where service_name = 'ABC Oto') and action = 'update'),
  '{"odometer_km": 58800, "description": "Motor yağı, yağ filtresi değişti"}'::jsonb,
  'audit yeni değerleri saklar'
);
select is(
  (select changed_by from public.service_record_audits
   where record_id = (select id from public.service_records where service_name = 'ABC Oto') and action = 'update'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'audit değişikliği yapan kullanıcıyı saklar'
);

update public.service_records set description = description where id = (select id from public.service_records where service_name = 'ABC Oto');
select is(
  (select count(*) from public.service_record_audits
   where record_id = (select id from public.service_records where service_name = 'ABC Oto') and action = 'update'),
  1::bigint,
  'değişiklik içermeyen güncelleme audit kaydı oluşturmaz'
);

select throws_ok(
  $$ update public.service_records set vehicle_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
     where id = (select id from public.service_records where service_name = 'ABC Oto') $$,
  '42501', null,
  'kayıt başka araca taşınamaz'
);
select throws_ok(
  $$ update public.service_records set entered_by = 'service' where id = (select id from public.service_records where service_name = 'ABC Oto') $$,
  '42501', null,
  'entered_by sonradan değiştirilemez'
);

update public.service_records set description = 'Değiştirildi' where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
select is(
  (select description from public.service_records where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  'Periyodik bakım',
  'A, servis tarafından girilmiş kaydı değiştiremez'
);

select throws_ok(
  $$ delete from public.service_records where id = (select id from public.service_records where service_name = 'ABC Oto') $$,
  '42501', null,
  'kayıtlar kalıcı olarak silinemez'
);
select throws_ok(
  $$ insert into public.service_record_audits (record_id, action) values ((select id from public.service_records where service_name = 'ABC Oto'), 'update') $$,
  '42501', null,
  'istemci audit tablosuna yazamaz'
);
select throws_ok(
  $$ delete from public.vehicles where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  '23503', null,
  'servis kaydı olan araç silinemez'
);

-- Soft delete
update public.service_records set deleted_at = '2000-01-01' where id = (select id from public.service_records where service_name = 'ABC Oto');
select ok(
  (select deleted_at > now() - interval '1 minute' from public.service_records where id = (select id from public.service_records where service_name = 'ABC Oto')),
  'silme zamanını istemci değil sunucu belirler'
);
select is(
  (select count(*) from public.service_record_audits
   where record_id = (select id from public.service_records where service_name = 'ABC Oto') and action = 'soft_delete'),
  1::bigint,
  'soft delete audit tablosuna yazılır'
);
select throws_ok(
  $$ update public.service_records set deleted_at = null where id = (select id from public.service_records where service_name = 'ABC Oto') $$,
  '55000', null,
  'silinmiş kayıt geri alınamaz / değiştirilemez'
);

-- ---------- Kullanıcı B ----------
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select count(*) from public.service_records where vehicle_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  0::bigint,
  'B, A''nın aracının kayıtlarını göremez'
);
select is(
  (select count(*) from public.service_record_audits),
  0::bigint,
  'B, A''nın kayıtlarının değişiklik geçmişini göremez'
);
select throws_ok(
  $$ select * from public.services $$,
  '42501', null,
  'services tablosu istemciye kapalı'
);

-- ---------- Anonim ----------
reset role;
set local role anon;
set local request.jwt.claims = '{"role": "anon"}';

select throws_ok(
  $$ select * from public.service_records $$,
  '42501', null,
  'anonim kullanıcı servis kayıtlarını okuyamaz'
);

select * from finish();
rollback;
