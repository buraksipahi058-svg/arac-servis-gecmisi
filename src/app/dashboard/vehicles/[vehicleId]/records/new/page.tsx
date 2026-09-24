import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/back-link";
import { RecordForm } from "@/components/records/record-form";
import { cardClass } from "@/components/ui/card";
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
    <div className="mx-auto max-w-lg">
      <BackLink href={`/dashboard/vehicles/${vehicle.id}`}>{formatPlate(vehicle.plate)}</BackLink>
      <h1 className="mb-5 mt-4 text-2xl font-bold tracking-tight">Servis kaydı ekle</h1>
      <div className={`${cardClass} p-5 sm:p-6`}>
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
    </div>
  );
}
