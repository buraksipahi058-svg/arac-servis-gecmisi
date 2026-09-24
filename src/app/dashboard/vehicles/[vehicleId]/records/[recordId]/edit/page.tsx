import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/back-link";
import { RecordForm } from "@/components/records/record-form";
import { cardClass } from "@/components/ui/card";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { todayIsoDate } from "@/lib/format";
import { getVehicleRecord, listOdometerPoints } from "@/lib/records/queries";
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
  // Düzenlenen kaydın kendisi karşılaştırmaya dahil edilmez.
  const odometerPoints = (await listOdometerPoints(vehicleId)).filter(
    (point) => point.id !== record.id,
  );

  return (
    <div className="mx-auto max-w-lg">
      <BackLink href={recordPath}>Kayda dön</BackLink>
      <h1 className="mb-2 mt-4 text-2xl font-bold tracking-tight">Servis kaydını düzenle</h1>
      <p className="mb-6 text-sm text-ink-500">
        Yapılan değişiklikler, önceki değerleriyle birlikte kaydın değişiklik geçmişinde görünür.
      </p>

      <div className={`${cardClass} p-5 sm:p-6`}>
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
        odometerPoints={odometerPoints}
        />
      </div>

      <div className="mt-8">
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
