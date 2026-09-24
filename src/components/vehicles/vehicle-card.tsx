import Link from "next/link";
import { History, Share2, Wrench } from "lucide-react";
import { buttonClass } from "@/components/ui/button-styles";
import { cardClass } from "@/components/ui/card";
import { Plate } from "@/components/vehicles/plate";
import { VehicleTypeIcon } from "@/components/vehicles/vehicle-type-icon";
import { formatKm } from "@/lib/format";
import type { VehicleOverview } from "@/lib/vehicles/queries";
import { vehicleTypeLabel } from "@/lib/vehicles/vehicle-types";

export function VehicleCard({ vehicle }: { vehicle: VehicleOverview }) {
  return (
    <article className={`${cardClass} flex h-full flex-col p-5`}>
      <div className="flex items-start justify-between gap-3">
        <Plate plate={vehicle.plate} />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
          <VehicleTypeIcon type={vehicle.vehicle_type} className="size-3.5" />
          {vehicleTypeLabel(vehicle.vehicle_type)}
        </span>
      </div>
      <p className="mt-4 text-lg font-semibold text-ink-900">
        {`${vehicle.make} ${vehicle.model} ${vehicle.model_year}`}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
        <Wrench aria-hidden className="size-3.5 shrink-0 text-gold-600" />
        {vehicle.recordCount === 0
          ? "Henüz servis kaydı yok"
          : `${vehicle.recordCount} servis kaydı · son kayıt ${formatKm(vehicle.latestKm ?? 0)}`}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-sand-100 pt-4">
        <Link href={`/dashboard/vehicles/${vehicle.id}`} className={buttonClass("primary", "sm")}>
          <History aria-hidden />
          Geçmişi Gör
        </Link>
        <Link
          href={`/dashboard/vehicles/${vehicle.id}/share`}
          className={buttonClass("secondary", "sm")}
        >
          <Share2 aria-hidden />
          Paylaş
        </Link>
      </div>
    </article>
  );
}
