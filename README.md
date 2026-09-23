# Araç Servis Geçmişi (MVP)

Şartname: [docs/MVP_SPEC.md](docs/MVP_SPEC.md)

Next.js (App Router, TypeScript strict, Tailwind) + Supabase (Auth, Postgres, Storage).
Geliştirme ortamı 192.168.1.13 Ubuntu hostunda çalışır: Supabase, Supabase CLI ile Docker'da (yerel), Next.js dev sunucusu 3001 portunda.

## Kurulum (host üzerinde)

```bash
npm install
npm run db:start          # Supabase container'larını başlatır
npm run db:status         # URL ve publishable key'i gösterir
cp .env.example .env.local  # değerleri doldur
npm run dev               # http://192.168.1.13:3001
```

| Servis | Adres |
| --- | --- |
| Uygulama | http://192.168.1.13:3001 |
| Supabase API | http://192.168.1.13:54321 |
| Supabase Studio | http://192.168.1.13:54323 |
| Mailpit (test e-postaları) | http://192.168.1.13:54324 |

## Kontroller

```bash
npm run lint
npm run typecheck
npm run build
npm run db:test           # veritabanı RLS testleri (pgTAP)
```

## Veritabanı

Şema değişiklikleri `supabase/migrations/` altında tutulur.

```bash
npx supabase migration up   # bekleyen migration'ları uygular
npm run db:types            # src/lib/supabase/database.types.ts dosyasını yeniden üretir
```
