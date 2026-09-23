import Link from "next/link";
import { buttonClass } from "@/components/ui/button-styles";
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
        className={`${buttonClass("secondary", "sm")} mt-4 w-full`}
      >
        Geçmişi Gör
      </Link>
    </article>
  );
}
