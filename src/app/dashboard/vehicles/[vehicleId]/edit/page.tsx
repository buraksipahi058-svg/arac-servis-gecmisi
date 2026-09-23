import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteVehicleButton } from "@/components/vehicles/delete-vehicle-button";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { formatPlate } from "@/lib/vehicles/plate";
import { getOwnVehicle } from "@/lib/vehicles/queries";
import { updateVehicle } from "../../actions";

export const metadata: Metadata = { title: "Aracı düzenle" };

export default async function EditVehiclePage({
  params,
}: PageProps<"/dashboard/vehicles/[vehicleId]/edit">) {
  const { vehicleId } = await params;
  const vehicle = await getOwnVehicle(vehicleId);
  if (!vehicle) notFound();

  const plateLabel = formatPlate(vehicle.plate);

  return (
    <div className="mx-auto max-w-sm">
      <Link href={`/dashboard/vehicles/${vehicle.id}`} className="text-sm text-gray-500">
        ← {plateLabel}
      </Link>
      <h1 className="mb-6 mt-3 text-xl font-semibold">Aracı düzenle</h1>

      <VehicleForm
        action={updateVehicle.bind(null, vehicle.id)}
        initialValues={{
          plate: plateLabel,
          make: vehicle.make,
          model: vehicle.model,
          modelYear: String(vehicle.model_year),
        }}
        submitLabel="Değişiklikleri kaydet"
        pendingText="Kaydediliyor…"
      />

      <div className="mt-10 border-t border-gray-200 pt-6">
        <DeleteVehicleButton vehicleId={vehicle.id} plateLabel={plateLabel} />
      </div>
    </div>
  );
}
