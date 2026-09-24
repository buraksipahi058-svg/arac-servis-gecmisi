import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Search, Users } from "lucide-react";
import { Avatar } from "@/components/profiles/avatar";
import { TitleBadge } from "@/components/profiles/title-badge";
import { buttonClass } from "@/components/ui/button-styles";
import { cardClass, emptyStateClass } from "@/components/ui/card";
import { isProvince, PROVINCES } from "@/lib/profiles/provinces";
import { searchProfiles } from "@/lib/profiles/queries";
import { isProfileTitle, PROFILE_TITLES } from "@/lib/profiles/titles";

export const metadata: Metadata = { title: "Kullanıcılar" };

const SELECT_CLASS =
  "h-12 w-full rounded-xl border border-sand-300 bg-white px-3 text-base text-ink-900 shadow-sm focus:border-ink-700 focus:outline-none focus:ring-4 focus:ring-gold-400/30";

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function UsersPage({ searchParams }: PageProps<"/dashboard/users">) {
  const params = await searchParams;
  const query = first(params.q).slice(0, 60);
  const titleParam = first(params.unvan);
  const cityParam = first(params.il);
  const title = isProfileTitle(titleParam) ? titleParam : undefined;
  const city = isProvince(cityParam) ? cityParam : undefined;

  const results = await searchProfiles({ query: query || undefined, title, city });

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Topluluk</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">Kullanıcılar</h1>
      <p className="mt-2 text-sm text-ink-600">
        Satıcıları, yetkili servisleri ve ustaları bul; profillerindeki unvanları ve onayları gör.
      </p>

      <form method="get" role="search" className={`${cardClass} mt-5 grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end`}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="q" className="text-sm font-semibold text-ink-800">
            Ad veya firma
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            maxLength={60}
            placeholder="Örn. Ahmet Usta"
            className="h-12 rounded-xl border border-sand-300 bg-white px-3 text-base text-ink-900 shadow-sm placeholder:text-ink-300 focus:border-ink-700 focus:outline-none focus:ring-4 focus:ring-gold-400/30"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="unvan" className="text-sm font-semibold text-ink-800">
            Unvan
          </label>
          <select id="unvan" name="unvan" defaultValue={title ?? ""} className={SELECT_CLASS}>
            <option value="">Tümü</option>
            {PROFILE_TITLES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="il" className="text-sm font-semibold text-ink-800">
            İl
          </label>
          <select id="il" name="il" defaultValue={city ?? ""} className={SELECT_CLASS}>
            <option value="">Tümü</option>
            {PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={buttonClass("primary")}>
          <Search aria-hidden />
          Ara
        </button>
      </form>

      {results.length === 0 ? (
        <div className={`${emptyStateClass} mt-6`}>
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gold-50 text-gold-700">
            <Users aria-hidden className="size-6" />
          </span>
          <p className="text-ink-600">Aramana uyan kullanıcı bulunamadı.</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2" aria-label="Kullanıcılar">
          {results.map((profile) => (
            <li key={profile.userId}>
              <Link
                href={`/dashboard/users/${profile.userId}`}
                className={`${cardClass} flex h-full items-start gap-3 p-4 transition-all hover:-translate-y-0.5 hover:border-sand-300 hover:shadow-md`}
              >
                <Avatar name={profile.displayName} />
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="truncate font-semibold text-ink-900">{profile.displayName}</span>
                  {profile.city && (
                    <span className="inline-flex items-center gap-1 text-sm text-ink-500">
                      <MapPin aria-hidden className="size-3.5" />
                      {profile.city}
                    </span>
                  )}
                  {profile.titles.length > 0 && (
                    <span className="flex flex-wrap gap-1.5">
                      {profile.titles.map((item) => (
                        <TitleBadge key={item.title} title={item.title} endorsementCount={item.endorsementCount} />
                      ))}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
