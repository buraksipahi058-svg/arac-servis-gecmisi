import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ProfileForm } from "@/components/profiles/profile-form";
import { cardClass } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getProfile, listTitlesWithEndorsers } from "@/lib/profiles/queries";
import { saveProfile } from "./actions";

export const metadata: Metadata = { title: "Profilim" };

export default async function MyProfilePage() {
  const { user } = await requireUser("/dashboard/profile");
  const [profile, titles] = await Promise.all([getProfile(user.id), listTitlesWithEndorsers(user.id)]);

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Hesabım</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Profilim</h1>
        </div>
        {profile && (
          <Link
            href={`/dashboard/users/${user.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink-700 underline decoration-gold-400 decoration-2 underline-offset-4"
          >
            Profilimi görüntüle
            <ExternalLink aria-hidden className="size-3.5" />
          </Link>
        )}
      </div>
      <p className="mt-2 text-sm text-ink-600">
        {profile
          ? "Profilin giriş yapmış diğer kullanıcılara görünür. Araçların ve servis kayıtların profilde gösterilmez."
          : "Henüz profilin yok. Profilini oluşturduğunda diğer kullanıcılar seni ve unvanlarını görebilir, sen de onların unvanlarını onaylayabilirsin."}
      </p>

      <div className={`${cardClass} mt-5 p-5 sm:p-6`}>
        <ProfileForm
          action={saveProfile}
          initialValues={{
            displayName: profile?.display_name ?? "",
            city: profile?.city ?? "",
            phone: profile?.phone ?? "",
            bio: profile?.bio ?? "",
            titles: titles.map((row) => row.title),
          }}
        />
      </div>
    </div>
  );
}
