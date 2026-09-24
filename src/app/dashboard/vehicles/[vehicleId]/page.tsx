import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, Pencil, Share2 } from "lucide-react";
import { RecordTimeline } from "@/components/records/record-timeline";
import { TimelineSummary } from "@/components/records/timeline-summary";
import { BackLink } from "@/components/ui/back-link";
import { buttonClass } from "@/components/ui/button-styles";
import { emptyStateClass } from "@/components/ui/card";
import { Plate } from "@/components/vehicles/plate";
import { VehicleTypeIcon } from "@/components/vehicles/vehicle-type-icon";
import { listVehicleTimeline } from "@/lib/records/queries";
import { groupByYear, summarizeTimeline } from "@/lib/records/timeline";
import { formatPlate } from "@/lib/vehicles/plate";
import { getOwnVehicle } from "@/lib/vehicles/queries";
import { vehicleTypeLabel } from "@/lib/vehicles/vehicle-types";

export async function generateMetadata({
  params,
}: PageProps<"/dashboard/vehicles/[vehicleId]">): Promise<Metadata> {
  const { vehicleId } = await params;
  const vehicle = await getOwnVehicle(vehicleId);
  return { title: vehicle ? formatPlate(vehicle.plate) : "Araç bulunamadı" };
}

export default async function VehiclePage({
  params,
}: PageProps<"/dashboard/vehicles/[vehicleId]">) {
  const { vehicleId } = await params;
  const vehicle = await getOwnVehicle(vehicleId);
  if (!vehicle) notFound();

  const entries = await listVehicleTimeline(vehicle.id);

  return (
    <>
      <BackLink href="/dashboard">Araçlarım</BackLink>

      <section className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-ink-900 to-ink-800 p-5 text-white shadow-card sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1>
              <Plate plate={vehicle.plate} size="lg" />
            </h1>
            <p className="mt-3 text-lg font-semibold">
              {`${vehicle.make} ${vehicle.model} ${vehicle.model_year}`}
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-200">
              <VehicleTypeIcon type={vehicle.vehicle_type} className="size-4 text-gold-300" />
              {vehicleTypeLabel(vehicle.vehicle_type)}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href={`/dashboard/vehicles/${vehicle.id}/share`}
              className={buttonClass("accent", "sm")}
            >
              <Share2 aria-hidden />
              Paylaş
            </Link>
            <Link
              href={`/dashboard/vehicles/${vehicle.id}/edit`}
              className={buttonClass("onDark", "sm")}
            >
              <Pencil aria-hidden />
              Düzenle
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight">Servis Geçmişi</h2>
          <Link
            href={`/dashboard/vehicles/${vehicle.id}/records/new`}
            className={`${buttonClass("primary", "sm")} shrink-0`}
          >
            + Servis Kaydı
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className={`${emptyStateClass} mt-4`}>
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gold-50 text-gold-700">
              <ClipboardList aria-hidden className="size-6" />
            </span>
            <p className="text-ink-600">Henüz servis kaydı yok.</p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-6">
            <TimelineSummary summary={summarizeTimeline(entries)} />
            <RecordTimeline
              years={groupByYear(entries)}
              getRecordHref={(recordId) => `/dashboard/vehicles/${vehicle.id}/records/${recordId}`}
            />
          </div>
        )}
      </section>
    </>
  );
}
