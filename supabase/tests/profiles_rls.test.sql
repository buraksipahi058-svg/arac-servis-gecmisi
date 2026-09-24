-- profiles, profile_titles ve title_endorsements için yetki, RLS ve bütünlük testleri.
begin;
create extension if not exists pgtap with schema extensions;

select plan(22);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'usta-a@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'user-b@test.local'),
  ('33333333-3333-3333-3333-333333333333', 'profilsiz-c@test.local');

-- ---------- A: profil ve unvan ----------
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.profiles (display_name, city, phone, bio) values ('Ahmet Usta', 'İstanbul', '+90 532 000 00 00', 'Motor ve şanzıman') $$,
  'kullanıcı kendi profilini oluşturabilir'
);
select throws_ok(
  $$ insert into public.profiles (user_id, display_name) values ('22222222-2222-2222-2222-222222222222', 'Sahte') $$,
  '42501', null,
  'başkası adına profil oluşturulamaz'
);
select throws_ok(
  $$ update public.profiles set display_name = 'X' $$,
  '23514', null,
  'görünen ad en az 2 karakter olmalı'
);
select lives_ok(
  $$ insert into public.profile_titles (title) values ('mechanic'), ('seller') $$,
  'kullanıcı kendine birden fazla unvan ekleyebilir'
);
select throws_ok(
  $$ insert into public.profile_titles (title) values ('dogrulanmis_servis') $$,
  '23514', null,
  'tanımsız unvan reddedilir'
);
select throws_ok(
  $$ insert into public.title_endorsements (holder_id, title) values ('11111111-1111-1111-1111-111111111111', 'mechanic') $$,
  '23514', null,
  'kullanıcı kendi unvanını onaylayamaz'
);

-- ---------- B: profil, onay ----------
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select display_name from public.profiles where user_id = '11111111-1111-1111-1111-111111111111'),
  'Ahmet Usta',
  'giriş yapmış kullanıcılar diğer profilleri görebilir'
);
select throws_ok(
  $$ insert into public.profile_titles (user_id, title) values ('11111111-1111-1111-1111-111111111111', 'authorized_service') $$,
  '42501', null,
  'başkasına unvan eklenemez'
);
update public.profiles set display_name = 'Değiştirildi' where user_id = '11111111-1111-1111-1111-111111111111';
delete from public.profile_titles where user_id = '11111111-1111-1111-1111-111111111111';

select lives_ok(
  $$ insert into public.profiles (display_name) values ('Burak B') $$,
  'B profil oluşturur'
);
select lives_ok(
  $$ insert into public.title_endorsements (holder_id, title) values ('11111111-1111-1111-1111-111111111111', 'mechanic') $$,
  'B, A''nın unvanını onaylayabilir'
);
select is(
  (select endorser_id from public.title_endorsements where holder_id = '11111111-1111-1111-1111-111111111111' and title = 'mechanic'),
  '22222222-2222-2222-2222-222222222222'::uuid,
  'onaylayan otomatik olarak giriş yapan kullanıcıdır'
);
select throws_ok(
  $$ insert into public.title_endorsements (holder_id, title) values ('11111111-1111-1111-1111-111111111111', 'mechanic') $$,
  '23505', null,
  'aynı unvan aynı kişi tarafından iki kez onaylanamaz'
);
select throws_ok(
  $$ insert into public.title_endorsements (holder_id, title) values ('11111111-1111-1111-1111-111111111111', 'authorized_service') $$,
  '23503', null,
  'kullanıcının sahip olmadığı unvan onaylanamaz'
);
select throws_ok(
  $$ insert into public.title_endorsements (holder_id, title, endorser_id)
     values ('11111111-1111-1111-1111-111111111111', 'seller', '33333333-3333-3333-3333-333333333333') $$,
  '42501', null,
  'başkası adına onay verilemez'
);

-- ---------- C: profilsiz kullanıcı ----------
set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';

select throws_ok(
  $$ insert into public.title_endorsements (holder_id, title) values ('11111111-1111-1111-1111-111111111111', 'seller') $$,
  '23503', null,
  'profili olmayan kullanıcı onay veremez'
);
delete from public.title_endorsements;

-- ---------- Tekrar A ----------
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select is(
  (select display_name from public.profiles where user_id = '11111111-1111-1111-1111-111111111111'),
  'Ahmet Usta',
  'B, A''nın profilini değiştiremedi'
);
select is(
  (select count(*) from public.profile_titles where user_id = '11111111-1111-1111-1111-111111111111'),
  2::bigint,
  'B, A''nın unvanlarını silemedi'
);
select is(
  (select count(*) from public.title_endorsements where holder_id = '11111111-1111-1111-1111-111111111111'),
  1::bigint,
  'C, B''nin onayını silemedi'
);
delete from public.title_endorsements;
select is(
  (select count(*) from public.title_endorsements where holder_id = '11111111-1111-1111-1111-111111111111'),
  1::bigint,
  'A, kendisine verilen onayı silemez (yalnızca onaylayan geri alabilir)'
);
delete from public.profile_titles where title = 'mechanic';
select is(
  (select count(*) from public.title_endorsements where holder_id = '11111111-1111-1111-1111-111111111111'),
  0::bigint,
  'unvan kaldırılınca ona verilen onaylar da silinir'
);

-- ---------- Anonim ----------
reset role;
set local role anon;
set local request.jwt.claims = '{"role": "anon"}';

select throws_ok(
  $$ select * from public.profiles $$,
  '42501', null,
  'anonim kullanıcı profilleri okuyamaz'
);
select throws_ok(
  $$ select * from public.title_endorsements $$,
  '42501', null,
  'anonim kullanıcı onayları okuyamaz'
);

select * from finish();
rollback;
