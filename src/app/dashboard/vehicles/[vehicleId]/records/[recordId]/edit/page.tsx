import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecordForm } from "@/components/records/record-form";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { todayIsoDate } from "@/lib/format";
import { getVehicleRecord } from "@/lib/records/queries";
import { deleteRecord, updateRecord } from "../../actions";

export const metadata: Metadata = { title: "Servis kaydını düzenle" };

export default async function EditRecordPage({
  params,
}: PageProps<"/dashboard/vehicles/[vehicleId]/records/[recordId]/edit">) {
  const { vehicleId, recordId } = await params;
  const record = await getVehicleRecord(vehicleId, recordId);
  // Servis tarafından girilen kayıtlar araç sahibi tarafından düzenlenemez (RLS ile de korunur).
  if (!record || record.entered_by !== "owner") notFound();

  const recordPath = `/dashboard/vehicles/${vehicleId}/records/${record.id}`;

  return (
    <div className="mx-auto max-w-sm">
      <Link href={recordPath} className="text-sm text-gray-500">
        ← Kayda dön
      </Link>
      <h1 className="mb-2 mt-3 text-xl font-semibold">Servis kaydını düzenle</h1>
      <p className="mb-6 text-sm text-gray-500">
        Yapılan değişiklikler, önceki değerleriyle birlikte kaydın değişiklik geçmişinde görünür.
      </p>

      <RecordForm
        action={updateRecord.bind(null, vehicleId, record.id)}
        initialValues={{
          serviceDate: record.service_date,
          odometerKm: String(record.odometer_km),
          serviceName: record.service_name,
          description: record.description,
        }}
        maxDate={todayIsoDate()}
        submitLabel="Değişiklikleri kaydet"
        pendingText="Kaydediliyor…"
      />

      <div className="mt-10 border-t border-gray-200 pt-6">
        <ConfirmActionButton
          action={deleteRecord.bind(null, vehicleId, record.id)}
          confirmMessage="Bu servis kaydı silinsin mi? Silinen kayıt geri alınamaz."
          label="Kaydı sil"
          pendingText="Siliniyor…"
        />
      </div>
    </div>
  );
}
