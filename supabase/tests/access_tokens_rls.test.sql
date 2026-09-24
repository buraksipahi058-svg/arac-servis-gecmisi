-- access_tokens için yetki, RLS ve trigger testleri.
-- Çalıştırma: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;

select plan(17);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'owner-a@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'user-b@test.local');

insert into public.vehicles (id, owner_id, plate, make, model, model_year) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '34ABC123', 'Toyota', 'Corolla', 2021),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '06DEF45', 'Renault', 'Clio', 2018);

select is(
  (select relrowsecurity from pg_class where oid = 'public.access_tokens'::regclass),
  true,
  'access_tokens tablosunda RLS açık'
);

-- ---------- Kullanıcı A ----------
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.access_tokens (vehicle_id, code_hash)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', encode(sha256('X7K9P4M2'::bytea), 'hex')) $$,
  'A kendi aracı için paylaşım kodu oluşturabilir'
);
select is(
  (select expires_at - created_at from public.access_tokens),
  interval '24 hours',
  'varsayılan geçerlilik 24 saat'
);
select throws_ok(
  $$ select code_hash from public.access_tokens $$,
  '42501', null,
  'kod hash''i istemci tarafından okunamaz'
);
select throws_ok(
  $$ insert into public.access_tokens (vehicle_id, code_hash, expires_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', repeat('a', 64), now() + interval '1 year') $$,
  '42501', null,
  'geçerlilik süresi istemciden belirlenemez'
);
select throws_ok(
  $$ insert into public.access_tokens (vehicle_id, code_hash)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', repeat('b', 64)) $$,
  '42501', null,
  'A, B''nin aracı için kod oluşturamaz'
);
select throws_ok(
  $$ insert into public.access_tokens (vehicle_id, code_hash)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'X7K9-P4M2') $$,
  '23514', null,
  'düz metin kod saklanamaz (yalnızca 64 karakterlik hex hash)'
);
select throws_ok(
  $$ insert into public.access_tokens (vehicle_id, code_hash)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', encode(sha256('X7K9P4M2'::bytea), 'hex')) $$,
  '23505', null,
  'aynı kod hash''i iki kez kullanılamaz'
);
select throws_ok(
  $$ delete from public.access_tokens $$,
  '42501', null,
  'paylaşım kodu silinemez (yalnızca iptal edilir)'
);
select throws_ok(
  $$ update public.access_tokens set vehicle_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  '42501', null,
  'kod başka araca taşınamaz'
);

-- ---------- Kullanıcı B ----------
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select count(*) from public.access_tokens),
  0::bigint,
  'B, A''nın paylaşım kodlarını göremez'
);
update public.access_tokens set revoked_at = now();

-- ---------- Tekrar A ----------
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select is(
  (select revoked_at is null from public.access_tokens),
  true,
  'B, A''nın kodunu iptal edemez'
);
update public.access_tokens set revoked_at = '2000-01-01';
select ok(
  (select revoked_at > now() - interval '1 minute' from public.access_tokens),
  'A kodunu iptal edebilir; iptal zamanını sunucu belirler'
);
select throws_ok(
  $$ update public.access_tokens set revoked_at = null $$,
  '55000', null,
  'iptal edilmiş kod yeniden açılamaz'
);

-- ---------- Yetkili rol: süre sınırı ----------
reset role;
select throws_ok(
  $$ insert into public.access_tokens (vehicle_id, code_hash, expires_at)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', repeat('c', 64), now() + interval '31 days') $$,
  '23514', null,
  'geçerlilik 30 günü aşamaz'
);
select is(
  (select count(*) from public.access_tokens where vehicle_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  1::bigint,
  'başarısız denemeler kayıt bırakmadı'
);

-- ---------- Anonim ----------
set local role anon;
set local request.jwt.claims = '{"role": "anon"}';

select throws_ok(
  $$ select id from public.access_tokens $$,
  '42501', null,
  'anonim kullanıcı paylaşım kodlarını okuyamaz'
);

select * from finish();
rollback;
