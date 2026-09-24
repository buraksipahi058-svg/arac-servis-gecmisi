import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Paperclip, Pencil, UserRound } from "lucide-react";
import { AddDocuments } from "@/components/documents/add-documents";
import { DocumentList } from "@/components/documents/document-list";
import { RecordOdometerWarning } from "@/components/records/odometer-warning";
import { RecordHistory } from "@/components/records/record-history";
import { BackLink } from "@/components/ui/back-link";
import { buttonClass } from "@/components/ui/button-styles";
import { cardClass } from "@/components/ui/card";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { FormAlert } from "@/components/ui/form-alert";
import { requireUser } from "@/lib/auth";
import { MAX_DOCUMENTS_PER_RECORD } from "@/lib/documents/constants";
import { listRecordDocuments } from "@/lib/documents/queries";
import { formatDate, formatKm } from "@/lib/format";
import { enteredByLabel } from "@/lib/records/entered-by";
import { findOdometerDrops } from "@/lib/records/odometer";
import { getVehicleRecord, listOdometerPoints, listRecordAudits } from "@/lib/records/queries";
import { formatPlate } from "@/lib/vehicles/plate";
import { getOwnVehicle } from "@/lib/vehicles/queries";
import { deleteDocument } from "../actions";

export const metadata: Metadata = { title: "Servis kaydı" };

export default async function RecordPage({
  params,
  searchParams,
}: PageProps<"/dashboard/vehicles/[vehicleId]/records/[recordId]">) {
  const { vehicleId, recordId } = await params;
  const { yuklenemeyen } = await searchParams;
  const [{ user }, vehicle, record] = await Promise.all([
    requireUser(),
    getOwnVehicle(vehicleId),
    getVehicleRecord(vehicleId, recordId),
  ]);
  if (!vehicle || !record) notFound();

  const [documents, audits, odometerPoints] = await Promise.all([
    listRecordDocuments(record.id),
    listRecordAudits(record.id),
    listOdometerPoints(vehicle.id),
  ]);
  const odometerDrop = findOdometerDrops(odometerPoints).get(record.id);
  const canEdit = record.entered_by === "owner";
  const remainingSlots = MAX_DOCUMENTS_PER_RECORD - documents.length;
  const failedUploadCount = Number(yuklenemeyen) || 0;

  return (
    <div className="mx-auto max-w-lg">
      <BackLink href={`/dashboard/vehicles/${vehicle.id}`}>{formatPlate(vehicle.plate)}</BackLink>

      {failedUploadCount > 0 && (
        <div className="mt-4">
          <FormAlert tone="error">
            {`Kayıt oluşturuldu ancak ${failedUploadCount} dosya yüklenemedi. Aşağıdan tekrar ekleyebilirsin.`}
          </FormAlert>
        </div>
      )}

      <article className={`${cardClass} mt-4 p-5 sm:p-6`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Servis kaydı</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{record.service_name}</h1>
            <p className="mt-1 font-medium tabular-nums text-ink-600">
              {`${formatDate(record.service_date)} · ${formatKm(record.odometer_km)}`}
            </p>
          </div>
          {canEdit && (
            <Link
              href={`/dashboard/vehicles/${vehicle.id}/records/${record.id}/edit`}
              className={`${buttonClass("secondary", "sm")} shrink-0`}
            >
              <Pencil aria-hidden />
              Düzenle
            </Link>
          )}
        </div>

        {odometerDrop && (
          <div className="mt-4">
            <RecordOdometerWarning odometerKm={record.odometer_km} previous={odometerDrop} />
          </div>
        )}

        <p className="mt-5 whitespace-pre-line break-words leading-relaxed text-ink-800">
          {record.description}
        </p>
        <p className="mt-5 flex items-center gap-1.5 border-t border-sand-100 pt-4 text-sm text-ink-500">
          <UserRound aria-hidden className="size-4" />
          {enteredByLabel(record.entered_by)}
        </p>
      </article>

      <section className={`${cardClass} mt-5 p-5 sm:p-6`}>
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Paperclip aria-hidden className="size-4 text-gold-600" />
          Belgeler
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          {documents.length === 0 ? (
            <p className="text-sm text-ink-500">Bu kayda belge veya fotoğraf eklenmemiş.</p>
          ) : (
            <DocumentList
              documents={documents}
              renderRemove={
                canEdit
                  ? (document) => (
                      <ConfirmActionButton
                        action={deleteDocument.bind(null, vehicle.id, record.id, document.id)}
                        confirmMessage={`"${document.fileName}" kaldırılsın mı? Bu işlem kaydın değişiklik geçmişine yazılır.`}
                        label="Kaldır"
                        pendingText="Kaldırılıyor…"
                        compact
                      />
                    )
                  : undefined
              }
            />
          )}

          {canEdit && remainingSlots > 0 && (
            <AddDocuments
              target={{ userId: user.id, vehicleId: vehicle.id, recordId: record.id }}
              remainingSlots={remainingSlots}
            />
          )}
        </div>
      </section>

      <RecordHistory audits={audits} />
    </div>
  );
}
