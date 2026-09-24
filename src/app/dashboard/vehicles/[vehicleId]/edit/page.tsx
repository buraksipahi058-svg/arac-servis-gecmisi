import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/back-link";
import { cardClass } from "@/components/ui/card";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { countAllVehicleRecords } from "@/lib/records/queries";
import { formatPlate } from "@/lib/vehicles/plate";
import { getOwnVehicle } from "@/lib/vehicles/queries";
import { deleteVehicle, updateVehicle } from "../../actions";

export const metadata: Metadata = { title: "Aracı düzenle" };

export default async function EditVehiclePage({
  params,
}: PageProps<"/dashboard/vehicles/[vehicleId]/edit">) {
  const { vehicleId } = await params;
  const vehicle = await getOwnVehicle(vehicleId);
  if (!vehicle) notFound();

  const plateLabel = formatPlate(vehicle.plate);
  const recordCount = await countAllVehicleRecords(vehicle.id);

  return (
    <div className="mx-auto max-w-lg">
      <BackLink href={`/dashboard/vehicles/${vehicle.id}`}>{plateLabel}</BackLink>
      <h1 className="mb-5 mt-4 text-2xl font-bold tracking-tight">Aracı düzenle</h1>

      <div className={`${cardClass} p-5 sm:p-6`}>
        <VehicleForm
          action={updateVehicle.bind(null, vehicle.id)}
          initialValues={{
            vehicleType: vehicle.vehicle_type,
            plate: plateLabel,
            make: vehicle.make,
            model: vehicle.model,
            modelYear: String(vehicle.model_year),
          }}
          submitLabel="Değişiklikleri kaydet"
          pendingText="Kaydediliyor…"
        />
      </div>

      <div className="mt-8">
        {recordCount > 0 ? (
          <p className="text-sm text-ink-500">Servis kaydı olan araç silinemez.</p>
        ) : (
          <ConfirmActionButton
            action={deleteVehicle.bind(null, vehicle.id)}
            confirmMessage={`${plateLabel} plakalı araç silinsin mi? Bu işlem geri alınamaz.`}
            label="Aracı sil"
            pendingText="Siliniyor…"
          />
        )}
      </div>
    </div>
  );
}
