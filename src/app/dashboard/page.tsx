import type { Metadata } from "next";
import Link from "next/link";
import { Car, UserRound } from "lucide-react";
import { buttonClass } from "@/components/ui/button-styles";
import { cardClass, emptyStateClass } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/form-alert";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/profiles/queries";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { listOwnVehicles } from "@/lib/vehicles/queries";

export const metadata: Metadata = { title: "Benim Araçlarım" };

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const { dogrulandi } = await searchParams;
  const { user } = await requireUser();
  const [vehicles, profile] = await Promise.all([listOwnVehicles(), getProfile(user.id)]);

  return (
    <>
      {dogrulandi === "1" && (
        <div className="mb-6">
          <FormAlert tone="success">E-posta adresin doğrulandı. Hoş geldin!</FormAlert>
        </div>
      )}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Garaj</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Benim Araçlarım</h1>
        </div>
        <Link href="/dashboard/vehicles/new" className={buttonClass("primary", "sm")}>
          + Araç Ekle
        </Link>
      </div>

      {!profile && (
        <div className={`${cardClass} mt-6 flex flex-col gap-3 border-l-4 border-l-gold-400 p-4 sm:flex-row sm:items-center sm:justify-between`}>
          <p className="flex items-start gap-2.5 text-sm text-ink-700">
            <UserRound aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-600" />
            Profilini oluştur: adın ve unvanların (satıcı, yetkili servis, usta) diğer kullanıcılara
            görünsün, sen de başkalarının unvanlarını onaylayabil.
          </p>
          <Link href="/dashboard/profile" className={`${buttonClass("secondary", "sm")} shrink-0`}>
            Profilini oluştur
          </Link>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className={`${emptyStateClass} mt-6`}>
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gold-50 text-gold-700">
            <Car aria-hidden className="size-6" />
          </span>
          <div>
            <p className="font-semibold text-ink-800">Henüz araç eklenmemiş.</p>
            <p className="mt-1 text-sm text-ink-600">
              Aracını ekle, servis kayıtlarını ve belgelerini tek yerde tut.
            </p>
          </div>
          <Link href="/dashboard/vehicles/new" className={buttonClass("primary")}>
            İlk aracını ekle
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id}>
              <VehicleCard vehicle={vehicle} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
