import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecordHistory } from "@/components/records/record-history";
import { buttonStyles } from "@/components/ui/button-styles";
import { formatDate, formatKm } from "@/lib/format";
import { enteredByLabel } from "@/lib/records/entered-by";
import { getVehicleRecord, listRecordAudits } from "@/lib/records/queries";
import { formatPlate } from "@/lib/vehicles/plate";
import { getOwnVehicle } from "@/lib/vehicles/queries";

export const metadata: Metadata = { title: "Servis kaydı" };

export default async function RecordPage({
  params,
}: PageProps<"/dashboard/vehicles/[vehicleId]/records/[recordId]">) {
  const { vehicleId, recordId } = await params;
  const [vehicle, record] = await Promise.all([
    getOwnVehicle(vehicleId),
    getVehicleRecord(vehicleId, recordId),
  ]);
  if (!vehicle || !record) notFound();

  const audits = await listRecordAudits(record.id);
  const canEdit = record.entered_by === "owner";

  return (
    <div className="mx-auto max-w-lg">
      <Link href={`/dashboard/vehicles/${vehicle.id}`} className="text-sm text-gray-500">
        ← {formatPlate(vehicle.plate)}
      </Link>

      <article className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{record.service_name}</h1>
            <p className="mt-0.5 text-gray-600">
              {`${formatDate(record.service_date)} · ${formatKm(record.odometer_km)}`}
            </p>
          </div>
          {canEdit && (
            <Link
              href={`/dashboard/vehicles/${vehicle.id}/records/${record.id}/edit`}
              className={`${buttonStyles.secondary} h-9 shrink-0 px-3 text-sm`}
            >
              Düzenle
            </Link>
          )}
        </div>

        <p className="mt-4 whitespace-pre-line break-words">{record.description}</p>
        <p className="mt-4 text-sm text-gray-500">{enteredByLabel(record.entered_by)}</p>
      </article>

      <RecordHistory audits={audits} />
    </div>
  );
}
