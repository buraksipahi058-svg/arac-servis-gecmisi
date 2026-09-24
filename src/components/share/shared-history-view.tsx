import { ClipboardList, Info, UserRound } from "lucide-react";
import { closeSharedHistory } from "@/app/shared/actions";
import { DocumentList } from "@/components/documents/document-list";
import { RecordTimeline } from "@/components/records/record-timeline";
import { TimelineSummary } from "@/components/records/timeline-summary";
import { emptyStateClass } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { Plate } from "@/components/vehicles/plate";
import { VehicleTypeIcon } from "@/components/vehicles/vehicle-type-icon";
import { formatDateTime } from "@/lib/format";
import { enteredByLabel } from "@/lib/records/entered-by";
import { groupByYear, summarizeTimeline } from "@/lib/records/timeline";
import type { SharedHistory } from "@/lib/share/shared-history";
import { vehicleTypeLabel } from "@/lib/vehicles/vehicle-types";

// Alıcının gördüğü ekran: yalnızca araç bilgisi ve servis geçmişi; sahibe ait bilgi yok.
export function SharedHistoryView({ history }: { history: SharedHistory }) {
  const { vehicle, entries } = history;

  return (
    <>
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-ink-900 to-ink-800 p-5 text-white shadow-card sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">
          Paylaşılan araç geçmişi
        </p>
        <h1 className="mt-3">
          <Plate plate={vehicle.plate} size="lg" />
        </h1>
        <p className="mt-3 text-lg font-semibold">
          {`${vehicle.make} ${vehicle.model} ${vehicle.modelYear}`}
        </p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-200">
          <VehicleTypeIcon type={vehicle.vehicleType} className="size-4 text-gold-300" />
          {vehicleTypeLabel(vehicle.vehicleType)}
        </p>
      </section>

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-500">
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        <span>
          {`Bu paylaşım ${formatDateTime(history.expiresAt)} tarihine kadar görüntülenebilir. `}
          Kayıtlar, kimin tarafından eklendiği bilgisiyle birlikte gösterilir; uygulama kayıtların
          içeriğini doğrulamaz.
        </span>
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold tracking-tight">Araç geçmişi</h2>
        {entries.length === 0 ? (
          <div className={`${emptyStateClass} mt-4`}>
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gold-50 text-gold-700">
              <ClipboardList aria-hidden className="size-6" />
            </span>
            <p className="text-ink-600">Bu araç için servis kaydı bulunmuyor.</p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-6">
            <TimelineSummary summary={summarizeTimeline(entries)} />
            <RecordTimeline
              years={groupByYear(entries)}
              renderDetails={(entry) => (
                <div className="mt-4 flex flex-col gap-3 border-t border-sand-100 pt-3">
                  <p className="flex items-center gap-1.5 text-xs text-ink-500">
                    <UserRound aria-hidden className="size-3.5" />
                    {enteredByLabel(entry.enteredBy)}
                    {entry.edited && " · Kayıt oluşturulduktan sonra düzenlenmiş"}
                  </p>
                  {entry.documents.length > 0 && <DocumentList documents={entry.documents} />}
                </div>
              )}
            />
          </div>
        )}
      </section>

      <form action={closeSharedHistory} className="mt-10">
        <SubmitButton variant="secondary" pendingText="Kapatılıyor…" className="w-full">
          Görüntülemeyi kapat
        </SubmitButton>
      </form>
    </>
  );
}
