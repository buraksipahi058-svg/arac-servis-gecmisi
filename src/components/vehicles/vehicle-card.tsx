import Link from "next/link";
import { buttonStyles } from "@/components/ui/button-styles";
import { formatPlate } from "@/lib/vehicles/plate";
import type { VehicleSummary } from "@/lib/vehicles/queries";

export function VehicleCard({ vehicle }: { vehicle: VehicleSummary }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-lg font-semibold tracking-wide">{formatPlate(vehicle.plate)}</p>
      <p className="mt-0.5 text-gray-600">
        {`${vehicle.make} ${vehicle.model} ${vehicle.model_year}`}
      </p>
      <Link
        href={`/dashboard/vehicles/${vehicle.id}`}
        className={`${buttonStyles.secondary} mt-4 h-10 w-full text-sm`}
      >
        Geçmişi Gör
      </Link>
    </article>
  );
}
