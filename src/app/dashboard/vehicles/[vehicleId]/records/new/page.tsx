import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecordForm } from "@/components/records/record-form";
import { todayIsoDate } from "@/lib/format";
import { formatPlate } from "@/lib/vehicles/plate";
import { getOwnVehicle } from "@/lib/vehicles/queries";
import { createRecord } from "../actions";

export const metadata: Metadata = { title: "Servis kaydı ekle" };

export default async function NewRecordPage({
  params,
}: PageProps<"/dashboard/vehicles/[vehicleId]/records/new">) {
  const { vehicleId } = await params;
  const vehicle = await getOwnVehicle(vehicleId);
  if (!vehicle) notFound();

  const today = todayIsoDate();

  return (
    <div className="mx-auto max-w-sm">
      <Link href={`/dashboard/vehicles/${vehicle.id}`} className="text-sm text-gray-500">
        ← {formatPlate(vehicle.plate)}
      </Link>
      <h1 className="mb-6 mt-3 text-xl font-semibold">Servis kaydı ekle</h1>
      <RecordForm
        action={createRecord.bind(null, vehicle.id)}
        initialValues={{ serviceDate: today, odometerKm: "", serviceName: "", description: "" }}
        maxDate={today}
        submitLabel="Kaydet"
        pendingText="Kaydediliyor…"
      />
    </div>
  );
}
