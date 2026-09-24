import { closeSharedHistory } from "@/app/shared/actions";
import { DocumentList } from "@/components/documents/document-list";
import { RecordTimeline } from "@/components/records/record-timeline";
import { TimelineSummary } from "@/components/records/timeline-summary";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatDateTime } from "@/lib/format";
import { enteredByLabel } from "@/lib/records/entered-by";
import { groupByYear, summarizeTimeline } from "@/lib/records/timeline";
import type { SharedHistory } from "@/lib/share/shared-history";
import { formatPlate } from "@/lib/vehicles/plate";

// Alıcının gördüğü ekran: yalnızca araç bilgisi ve servis geçmişi; sahibe ait bilgi yok.
export function SharedHistoryView({ history }: { history: SharedHistory }) {
  const { vehicle, entries } = history;

  return (
    <>
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">Araç</p>
        <h1 className="text-xl font-semibold tracking-wide">{formatPlate(vehicle.plate)}</h1>
        <p className="mt-0.5 text-gray-600">
          {`${vehicle.make} ${vehicle.model} ${vehicle.modelYear}`}
        </p>
      </section>

      <p className="mt-3 text-xs text-gray-500">
        {`Bu paylaşım ${formatDateTime(history.expiresAt)} tarihine kadar görüntülenebilir. `}
        Kayıtlar, kimin tarafından eklendiği bilgisiyle birlikte gösterilir; uygulama kayıtların
        içeriğini doğrulamaz.
      </p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Araç geçmişi</h2>
        {entries.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center">
            <p className="text-gray-600">Bu araç için servis kaydı bulunmuyor.</p>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-5">
            <TimelineSummary summary={summarizeTimeline(entries)} />
            <RecordTimeline
              years={groupByYear(entries)}
              renderDetails={(entry) => (
                <div className="mt-3 flex flex-col gap-3 border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-500">
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
