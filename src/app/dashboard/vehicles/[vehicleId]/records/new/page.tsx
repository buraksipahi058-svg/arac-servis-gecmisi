import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecordForm } from "@/components/records/record-form";
import { requireUser } from "@/lib/auth";
import { todayIsoDate } from "@/lib/format";
import { listOdometerPoints } from "@/lib/records/queries";
import { formatPlate } from "@/lib/vehicles/plate";
import { getOwnVehicle } from "@/lib/vehicles/queries";
import { createRecord } from "../actions";

export const metadata: Metadata = { title: "Servis kaydı ekle" };

export default async function NewRecordPage({
  params,
}: PageProps<"/dashboard/vehicles/[vehicleId]/records/new">) {
  const { vehicleId } = await params;
  const [{ user }, vehicle] = await Promise.all([requireUser(), getOwnVehicle(vehicleId)]);
  if (!vehicle) notFound();
  const odometerPoints = await listOdometerPoints(vehicle.id);

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
        odometerPoints={odometerPoints}
        documentUpload={{ userId: user.id, vehicleId: vehicle.id }}
      />
    </div>
  );
}
