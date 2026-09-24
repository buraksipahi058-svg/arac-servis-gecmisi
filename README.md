# Araç Servis Geçmişi (MVP)

Bir aracın bakım, onarım ve parça değişimi geçmişini tek yerde tutan ve araç sahibinin kontrolünde,
süreli bir kodla başkasına gösterebildiği web uygulaması.

- Şartname: [docs/MVP_SPEC.md](docs/MVP_SPEC.md)
- Güvenlik modeli ve production öncesi liste: [docs/SECURITY.md](docs/SECURITY.md)

Next.js 16 (App Router, TypeScript strict, Tailwind) + Supabase (Auth, Postgres + RLS, Storage).

## Özellikler

- Kayıt, giriş, çıkış (Supabase Auth, cookie tabanlı oturum)
- Araç ekleme/düzenleme/silme; araç tipi (otomobil, motosiklet, otobüs, minibüs, kamyonet, kamyon, traktör)
  (servis kaydı olan araç silinemez)
- Servis kaydı: tarih, km, servis, işlem açıklaması; düzenleme ve silme değişiklik geçmişine yazılır
- Belge/fotoğraf: fotoğraflar tarayıcıda ~1600 px'e küçültülüp sıkıştırılır; private bucket, signed URL
- Yıllara göre zaman çizelgesi, belge/fotoğraf sayıları, km tutarsızlığı uyarısı
- Paylaşım kodu (`XXXX-XXXX`, 24 saat, iptal edilebilir; yalnızca hash saklanır)
- Alıcı görünümü: plaka + kod ile, yalnızca araç ve servis geçmişi (sahip bilgisi yok)
- Kullanıcı profili (görünen ad, il, isteğe bağlı telefon), unvanlar (satıcı / yetkili servis / usta —
  kendi beyanı), diğer kullanıcıların unvan onayları ve onay listesi, kullanıcı arama (ad, unvan, il)

Uygulama araç veya kullanıcı hakkında hüküm vermez; kayıtları, kimin eklediğini ve kaç kullanıcının
bir unvanı onayladığını gösterir ("doğrulanmış" ifadesi kullanılmaz).

## Sayfalar

| Yol | Açıklama |
| --- | --- |
| `/` | Giriş sayfası |
| `/signup`, `/login` | Kayıt, giriş |
| `/dashboard` | Benim Araçlarım |
| `/dashboard/vehicles/[id]` | Araç ve servis geçmişi |
| `/dashboard/vehicles/[id]/records/[recordId]` | Servis kaydı, belgeler, değişiklik geçmişi |
| `/dashboard/vehicles/[id]/share` | Paylaşım kodu oluşturma/iptal |
| `/dashboard/users` | Kullanıcılar: ad, unvan ve ile göre arama |
| `/dashboard/users/[userId]` | Kullanıcı profili, unvanlar, onay listesi, onayladıkları |
| `/dashboard/profile` | Profilim (düzenleme) |
| `/shared` | Alıcı: plaka + kod ile geçmişi görüntüleme |

## Kurulum (192.168.1.13 Ubuntu hostu)

```bash
npm install
npm run db:start            # Supabase container'ları (Docker)
npm run db:status           # URL, publishable ve secret key
cp .env.example .env.local  # değerleri doldur (secret key yalnızca sunucuda)
npm run dev                 # http://192.168.1.13:3001
```

| Servis | Adres |
| --- | --- |
| Uygulama | http://192.168.1.13:3001 |
| Supabase API | http://192.168.1.13:54321 |
| Supabase Studio | http://192.168.1.13:54323 |
| Mailpit (test e-postaları) | http://192.168.1.13:54324 |

Host yeniden başlarsa Supabase container'ları kendiliğinden kalkar; `npm run dev` yeniden çalıştırılmalıdır.

## Kontroller

```bash
npm run lint
npm run typecheck
npm run build
npm run db:test                              # pgTAP: RLS, yetkiler, trigger'lar, storage
npx supabase db advisors --local --type all  # Supabase güvenlik/performans denetleyicisi
```

## Veritabanı

Şema değişiklikleri `supabase/migrations/` altında, testleri `supabase/tests/` altındadır.

```bash
npx supabase migration up   # bekleyen migration'ları uygular
npm run db:types            # src/lib/supabase/database.types.ts dosyasını yeniden üretir
```
