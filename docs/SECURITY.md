# Güvenlik modeli ve gözden geçirme

Adım 9'daki gözden geçirme ve deploy öncesi denetim (25.09.2026) sonuçları.

## Katmanlar

1. **Veritabanı (asıl koruma):** Tüm `public` tablolarında RLS açık. `anon` rolünün hiçbir tablo yetkisi yok.
   `authenticated` yalnızca gereken sütunlarda yetkili (sütun düzeyi GRANT); sahiplik alanları (`owner_id`),
   `entered_by`, zaman damgaları, belge türü/boyutu ve paylaşım kodu süresi istemciden yazılamaz.
   Paylaşım kodu hash'i istemciye okunamaz. `public` şemasında istemcinin çalıştırabileceği fonksiyon yok.
2. **Storage:** `record-documents` bucket'ı private (10 MB, JPG/PNG/WEBP/PDF). Yol
   `{owner_id}/{vehicle_id}/{record_id}/{uuid}.ext`; yükleme/silme yalnızca kendi aracının silinmemiş ve
   kendi girdiği kaydına. Üzerine yazma yok. Kayıt başına en fazla 10 belge. Belgeler 10 dakikalık signed URL
   ile gösterilir.
3. **Sunucu (Next.js):** Oturum gerektiren her server action `requireUser` ile başlar; sayfalar proxy'ye ek
   olarak oturumu kendileri de doğrular. URL/form'dan gelen ID'ler UUID olarak doğrulanır; RLS ikinci katmandır.
   Server action'lar Next'in Origin denetimiyle başka sitelerden tetiklenemez (CSRF).
4. **Paylaşım görünümü:** Plaka + kod sunucuda doğrulanır (hash, plaka, süre, iptal); tüm hatalarda aynı
   mesaj; istemci başına 15 dakikada 10 hatalı deneme. Service role client (`src/lib/supabase/admin.ts`,
   `server-only`) yalnızca burada ve yalnızca whitelist alanlar için kullanılır. Erişim httpOnly, `/shared`
   yoluyla sınırlı ve HMAC ile imzalı bir çerezle sağlanır (anahtar sunucunun gizli anahtarından türetilir);
   imzasız veya değiştirilmiş çerez veritabanına sorulmadan reddedilir, geçerli çerez her istekte yeniden
   doğrulanır (iptal/süre anında etkili).
5. **Profiller ve onaylar:** Profiller yalnızca giriş yapmış kullanıcılara açıktır (anonim erişim ve
   paylaşım görünümü dışında); e-posta profilde tutulmaz, telefon isteğe bağlıdır. Kullanıcı yalnızca kendi
   profilini ve unvanlarını düzenler. Onay veren kişi DB'de `auth.uid()` ile belirlenir (başkası adına onay
   verilemez), onay için profil gerekir, kendi unvanı onaylanamaz, aynı unvan bir kez onaylanır, onayı
   yalnızca veren geri alır; unvan kaldırılınca onayları silinir.
   Not: Onaylar kullanıcı beyanıdır; sahte hesaplarla sayı şişirilebilir. Uygulama bunları "doğrulanmış"
   olarak sunmaz.
6. **Kayıt ve e-posta doğrulama:** Hesap, e-postadaki tek kullanımlık bağlantıyla doğrulanmadan oturum açamaz
   (`[auth.email] enable_confirmations`). Bağlantı `/auth/confirm` onay sayfasını açar; sayfayı açmak (GET/HEAD)
   hiçbir şey değiştirmez, token kullanıcı butona bastığında (POST, server action) `verifyOtp` ile doğrulanır.
   Böylece e-posta güvenlik tarayıcılarının bağlantıyı önceden açması token'ı tüketmez ve başka bir site
   kullanıcıyı kendi hesabının bağlantısına yönlendirerek oturum açtıramaz (login CSRF). Yalnızca
   `email`/`signup` türleri kabul edilir, yönlendirme `safeNextPath` ile yalnızca `/dashboard` altınadır;
   geçersiz, süresi dolmuş veya kullanılmış bağlantılar aynı genel mesaja düşer. Kayıtlı bir adresle kayıt
   denemesi, yeni kayıtla aynı "E-postanı kontrol et" yanıtını alır; bunun için GoTrue'da e-posta **ve** SMS
   otomatik onayı kapalı olmalıdır (`[auth.sms] enable_confirmations = true`), biri açıksa GoTrue "User already
   registered" döner. Aynı adrese en fazla dakikada bir doğrulama e-postası gönderilir. Şifre değişikliği yakın
   zamanda giriş ya da yeniden kimlik doğrulama ister (`secure_password_change`).
   Not: GoTrue API'sine doğrudan yapılan kayıt isteğinde, kayıtlı adres için dönen sahte kullanıcının
   `identities` dizisi boştur; adresin kayıtlı olduğu API üzerinden yine anlaşılabilir (GoTrue kısıtı).
7. **Tarayıcı:** Tüm yanıtlarda CSP (nonce'suz: `default-src 'self'`, bağlantı ve görseller yalnızca uygulama ve
   Supabase adresine, `object-src 'none'`, `base-uri`/`form-action 'self'`, `frame-ancestors 'none'`), HSTS,
   `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`; HTTPS isteklerinde COOP. Oturum
   çerezleri `SameSite=Lax`, HTTPS'te `Secure`. Kodda `dangerouslySetInnerHTML`/`eval` yok; kullanıcı verisi
   React tarafından kaçışlanır.
8. **Deneme sınırları:** İstemci IP'si `X-Forwarded-For`'daki, bizim ters vekilimizin eklediği girdiden okunur
   (sondan `TRUSTED_PROXY_HOPS`'uncu, varsayılan 1). İstemcinin yazdığı ilk girdiler dikkate alınmaz.

## Otomatik kontroller

- `npm run db:test` — pgTAP (118 test): RLS, yetkiler, trigger'lar, storage politikaları (üzerine yazma ve
  anonim yükleme dahil) ve genel kurallar (`security_hardening.test.sql`: tüm tablolarda RLS, `anon` yetkisi
  yok, istemci rolleri public fonksiyonları çalıştıramaz, security definer fonksiyonlarda sabit `search_path`).
- `npx supabase db advisors --local` — Supabase güvenlik/performans denetleyicisi.
- `npm audit`
- Uçtan uca güvenlik betikleri (hosttaki `~/e2e-arac/sec-*`): anonim ve başka kullanıcı adına doğrudan API
  denemeleri, CSRF, doğrulama bağlantısı (açık yönlendirme, GET/HEAD, başka siteden onay), paylaşım çerezi
  (imzasız/değiştirilmiş), `X-Forwarded-For` taklidi.

## Adım 9'da düzeltilenler

| Bulgu | Düzeltme |
| --- | --- |
| Girişteki `next` parametresi ile açık yönlendirme (`/%09/evil.com` → `evil.com`) | `safeNextPath`: URL ayrıştırma, kontrol karakteri reddi, yalnızca `/dashboard` altı |
| Giriş formunda deneme sınırı yoktu | İstemci + e-posta başına 15 dk'da 10 hatalı deneme |
| Güvenlik başlıkları yoktu, `X-Powered-By` açıktı | `X-Frame-Options`, `frame-ancestors`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` |
| Yeni tablo/fonksiyonlar varsayılan olarak `anon`/`authenticated`'a açılıyordu | `public` şeması varsayılan yetkileri kaldırıldı |
| Deneme sayacı sınırsız bellek kullanabiliyordu | En fazla 10.000 istemci anahtarı |
| `service_records.service_id` FK indeksi yoktu | İndeks eklendi |

## Deploy öncesi denetimde düzeltilenler

| Bulgu | Düzeltme |
| --- | --- |
| Deneme sınırları `X-Forwarded-For`'un istemcinin yazabildiği ilk girdisini kullanıyordu; ters vekil arkasında bile sınır, her denemede farklı başlık gönderilerek atlatılabiliyordu | Vekilin eklediği girdi kullanılır (`TRUSTED_PROXY_HOPS`) |
| Paylaşım çerezi düz `plaka:kod` idi ve her istekte sınırsız doğrulanıyordu; elle yazılan çerezle formdaki deneme sınırı atlatılabiliyordu | Çerez HMAC ile imzalanır; imzasız/değiştirilmiş çerez reddedilir |
| Doğrulama bağlantısını açmak (GET, hatta HEAD) hesabı doğruluyor ve oturum açıyordu: e-posta tarayıcıları token'ı tüketebiliyor, başka bir site kullanıcıyı saldırganın hesabına sokabiliyordu | Bağlantı onay sayfası açar; doğrulama butonla (POST) |
| CSP yalnızca `frame-ancestors` idi; HSTS yoktu | Tam CSP, HSTS, HTTPS'te COOP |
| Oturum çerezleri HTTPS'te de `Secure` değildi | HTTPS isteklerinde `Secure` |
| Şifre değişikliği yeniden kimlik doğrulama istemiyordu | `secure_password_change = true` |
| Kullanılmayan GraphQL şeması ve S3 protokolü açıktı | Kapatıldı |
| pgTAP storage üzerine yazmayı, anonim yüklemeyi, `service_id` yazımını ve profil silmeyi denetlemiyordu | 6 test eklendi |

## Bilinen, düşük riskli konular

- **Kılık değiştirmiş dosya:** Bucket, türü istemcinin bildirdiği `Content-Type`'a göre denetler; HTML içerik
  `image/png` diye yüklenebilir. Supabase Storage dosyayı bildirilen türle (`image/png`) sunduğu için tarayıcıda
  çalışmaz; HTML ve SVG türleri reddedilir. Storage uygulamadan ayrı bir adreste durduğu için risk düşüktür;
  production'da da Supabase ayrı bir (alt) alan adında kalmalıdır.
- **Belge satırı eklerken var/yok farkı:** Başkasının dosya yolunu tam (dört UUID) bilen biri, o yolda dosya olup
  olmadığını hata kodundan anlayabilir; içerik veya meta veri görünmez.
- **CSP'de `'unsafe-inline'`:** Next'in satır içi betikleri için gerekir (nonce'lu CSP tüm sayfaları dinamik
  yapmayı gerektirir). XSS'e karşı asıl koruma React'in kaçışlamasıdır.
- **Hesap silme:** Servis kaydı olan kullanıcının `auth.users` satırı silinemez (`on delete restrict`); silme
  talepleri için elle bir prosedür gerekir.

## Production öncesi yapılacaklar

- [ ] HTTPS ve önünde güvenilir bir ters vekil (reverse proxy): `X-Forwarded-For`'a istemci adresini eklemeli
      (ya da üzerine yazmalı) ve `X-Forwarded-Proto: https` göndermeli. Next sunucusuna doğrudan (vekili
      atlayarak) erişilememeli; aksi hâlde `X-Forwarded-For` taklit edilebilir. Birden fazla vekil katmanı varsa
      (ör. Cloudflare + nginx) `TRUSTED_PROXY_HOPS` buna göre ayarlanmalı.
- [ ] Supabase Auth: gerçek SMTP sağlayıcısı (yerelde e-postalar Mailpit'e düşer) ve buna uygun `email_sent`
      hız sınırı; `site_url` ve `additional_redirect_urls` production alan adıyla (doğrulama bağlantısı
      `site_url` üzerinden kurulur); `supabase/templates/confirmation.html` şablonu ve konu satırı projeye
      aktarılmalı; e-posta ve SMS otomatik onayı kapalı (`MAILER_AUTOCONFIRM=false`, `SMS_AUTOCONFIRM=false`),
      `secure_password_change` açık.
- [ ] Supabase Auth hız sınırları: giriş, kayıt, doğrulama ve oturum yenileme Next sunucusu üzerinden yapıldığı
      için Supabase tüm kullanıcıları sunucunun IP'si olarak görür. Giriş/kayıt, doğrulama ve token yenileme
      sınırları kullanıcı sayısına göre yükseltilmeli ve bir yük denemesiyle doğrulanmalı.
- [ ] Kayıt ve girişte CAPTCHA (Cloudflare Turnstile veya hCaptcha; Supabase Auth destekler): açık kayıtta bot
      hesaplarını ve başkalarının adresine doğrulama e-postası yağdırılmasını engeller.
- [ ] Supabase projesi: Data API'de yalnızca `public` şeması (GraphQL kullanılmıyor; `pg_graphql` kapatılabilir),
      S3 erişim anahtarı oluşturulmamalı, yeni tablolar yalnızca migration ile (`postgres` rolüyle) eklenmeli,
      deploy sonrası advisors çalıştırılmalı; veritabanında SSL zorunluluğu ve ağ kısıtlaması, yedekleme.
- [ ] Deneme sınırları bellek içi: birden fazla sunucu süreci varsa ortak bir depoya (ör. Postgres/Redis) taşı.
- [ ] Yerel CLI'ın paylaşılan varsayılan anahtarları yerine production projesinin anahtarları;
      `SUPABASE_SECRET_KEY` yalnızca sunucu ortam değişkeni olarak (değiştirilirse açık paylaşım çerezleri
      geçersiz olur, alıcı kodu yeniden girer).
- [ ] Yasal (KVKK): aydınlatma metni ve gereken yerde açık rıza (e-posta, telefon, plaka ve araç geçmişi kişisel
      veridir), veri silme/erişim talepleri için süreç, verinin tutulduğu bölge.
- [ ] İsteğe bağlı: paylaşım kodu hash'ine sunucu tarafı gizli anahtar (HMAC); belgeleri sunucu üzerinden
      aktarma (signed URL'lerde sahip/araç/kayıt UUID'leri görünür); kullanıcı başına depolama kotası;
      nonce'lu CSP.

## Geliştirme hostu (192.168.1.13) hakkında

Supabase CLI yerel geliştirme içindir: tüm servisler `0.0.0.0`'a bağlanır. Veritabanı (54322) varsayılan
`postgres/postgres` şifresiyle, Studio (54323) ve Mailpit (54324) şifresiz olarak yerel ağa açıktır.
Mailpit'te doğrulama bağlantıları durduğundan, yerel ağdaki herkes bu bağlantılarla hesap doğrulayabilir.
Yerel ağda güvenilmeyen cihaz varsa bu portlar yalnızca host ve geliştirici bilgisayarına açılmalıdır
(Docker yayınlanan portlarda `ufw`'yi atladığı için kural `DOCKER-USER` zincirine yazılmalıdır).
Uygulama bu hostta ters vekil olmadan çalıştığı için deneme sınırları burada taklit edilebilir.
