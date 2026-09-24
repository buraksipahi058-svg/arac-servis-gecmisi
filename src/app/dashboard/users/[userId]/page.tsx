import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Info, MapPin, Pencil, Phone, ThumbsUp, Undo2 } from "lucide-react";
import { Avatar } from "@/components/profiles/avatar";
import { TitleBadge } from "@/components/profiles/title-badge";
import { ActionButton } from "@/components/ui/action-button";
import { BackLink } from "@/components/ui/back-link";
import { buttonClass } from "@/components/ui/button-styles";
import { cardClass } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { formatTimestampDate } from "@/lib/format";
import { getProfile, listEndorsementsGiven, listTitlesWithEndorsers } from "@/lib/profiles/queries";
import { profileTitleLabel } from "@/lib/profiles/titles";
import { endorseTitle, withdrawEndorsement } from "./actions";

const memberSinceFormatter = new Intl.DateTimeFormat("tr-TR", {
  month: "long",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

export async function generateMetadata({ params }: PageProps<"/dashboard/users/[userId]">): Promise<Metadata> {
  const { userId } = await params;
  const profile = await getProfile(userId);
  return { title: profile?.display_name ?? "Kullanıcı bulunamadı" };
}

export default async function UserProfilePage({ params }: PageProps<"/dashboard/users/[userId]">) {
  const { userId } = await params;
  const [{ user }, profile] = await Promise.all([requireUser(`/dashboard/users/${userId}`), getProfile(userId)]);
  if (!profile) notFound();

  const [titles, given, viewerProfile] = await Promise.all([
    listTitlesWithEndorsers(profile.user_id),
    listEndorsementsGiven(profile.user_id),
    getProfile(user.id),
  ]);
  const isSelf = user.id === profile.user_id;

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/dashboard/users">Kullanıcılar</BackLink>

      <section className="mt-4 rounded-2xl bg-gradient-to-br from-ink-900 to-ink-800 p-5 text-white shadow-card sm:p-6">
        <div className="flex items-start gap-4">
          <Avatar name={profile.display_name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{profile.display_name}</h1>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-200">
              {profile.city && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden className="size-4 text-gold-300" />
                  {profile.city}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden className="size-4 text-gold-300" />
                {`Katılım: ${memberSinceFormatter.format(new Date(profile.created_at))}`}
              </span>
              {profile.phone && (
                <a href={`tel:${profile.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 underline decoration-gold-400 underline-offset-4">
                  <Phone aria-hidden className="size-4 text-gold-300" />
                  {profile.phone}
                </a>
              )}
            </p>
          </div>
          {isSelf && (
            <Link href="/dashboard/profile" className={buttonClass("onDark", "sm")}>
              <Pencil aria-hidden />
              Düzenle
            </Link>
          )}
        </div>
        {profile.bio && <p className="mt-4 whitespace-pre-line break-words text-sm leading-relaxed text-ink-100">{profile.bio}</p>}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold tracking-tight">Unvanlar ve onaylar</h2>
        <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-ink-500">
          <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          Unvanlar kullanıcının kendi beyanıdır; onaylar diğer kullanıcılar tarafından verilir.
          Uygulama unvanları doğrulamaz.
        </p>

        {titles.length === 0 ? (
          <p className="mt-4 text-sm text-ink-600">Bu kullanıcı henüz unvan eklememiş.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {titles.map(({ title, endorsers }) => {
              const viewerEndorsed = endorsers.some((endorser) => endorser.userId === user.id);
              return (
                <li key={title} data-testid={`title-${title}`} className={`${cardClass} p-5`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <TitleBadge title={title} />
                      <p className="mt-2 text-sm text-ink-600">
                        <span className="font-semibold text-ink-900">{`${endorsers.length} kullanıcı onayladı`}</span>
                        {" · kendi beyanı"}
                      </p>
                    </div>
                    {!isSelf &&
                      (viewerProfile ? (
                        viewerEndorsed ? (
                          <ActionButton action={withdrawEndorsement.bind(null, profile.user_id, title)} variant="secondary" pendingText="Geri alınıyor…">
                            <Undo2 aria-hidden />
                            Onayı geri al
                          </ActionButton>
                        ) : (
                          <ActionButton action={endorseTitle.bind(null, profile.user_id, title)} pendingText="Onaylanıyor…">
                            <ThumbsUp aria-hidden />
                            Onayla
                          </ActionButton>
                        )
                      ) : (
                        <Link href="/dashboard/profile" className="text-sm font-semibold text-ink-700 underline decoration-gold-400 decoration-2 underline-offset-4">
                          Onaylamak için profilini oluştur
                        </Link>
                      ))}
                  </div>

                  {endorsers.length > 0 && (
                    <div className="mt-4 border-t border-sand-100 pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Onay listesi</p>
                      <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                        {endorsers.map((endorser) => (
                          <li key={endorser.userId} className="flex items-center justify-between gap-3">
                            <Link href={`/dashboard/users/${endorser.userId}`} className="truncate font-medium text-ink-800 hover:underline">
                              {endorser.displayName}
                            </Link>
                            <span className="shrink-0 text-xs text-ink-500">{formatTimestampDate(endorser.createdAt)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold tracking-tight">Onayladıkları</h2>
        {given.length === 0 ? (
          <p className="mt-3 text-sm text-ink-600">Bu kullanıcı henüz kimsenin unvanını onaylamamış.</p>
        ) : (
          <ul className={`${cardClass} mt-3 divide-y divide-sand-100`}>
            {given.map((item) => (
              <li key={`${item.holderId}-${item.title}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0 truncate">
                  <Link href={`/dashboard/users/${item.holderId}`} className="font-semibold text-ink-900 hover:underline">
                    {item.holderName}
                  </Link>
                  <span className="text-ink-600">{` · ${profileTitleLabel(item.title)}`}</span>
                </span>
                <span className="shrink-0 text-xs text-ink-500">{formatTimestampDate(item.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
