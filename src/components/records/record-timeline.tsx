import type { ReactNode } from "react";
import Link from "next/link";
import { Calendar, Camera, FileText, Gauge, TriangleAlert } from "lucide-react";
import { cardClass } from "@/components/ui/card";
import { formatDate, formatKm } from "@/lib/format";
import type { TimelineEntry, TimelineYear } from "@/lib/records/timeline";

type RecordTimelineProps<T extends TimelineEntry> = {
  years: TimelineYear<T>[];
  // Verilirse her kayıt detay sayfasına bağlanır (sahip görünümü).
  getRecordHref?: (recordId: string) => string;
  // Verilirse kayıt kartının altında gösterilir (paylaşım görünümü: belgeler, kaynak).
  renderDetails?: (entry: T) => ReactNode;
};

const ENTRY_CARD = `${cardClass} block p-4 sm:p-5`;

// Servis kayıtları, yıllara göre gruplu ve en yeni önce.
export function RecordTimeline<T extends TimelineEntry>({
  years,
  getRecordHref,
  renderDetails,
}: RecordTimelineProps<T>) {
  return (
    <div className="flex flex-col gap-7">
      {years.map(({ year, entries }) => (
        <section key={year} aria-labelledby={`year-${year}`}>
          <h3
            id={`year-${year}`}
            className="inline-flex rounded-full bg-ink-900 px-3 py-1 text-xs font-bold tracking-wider text-white"
          >
            {year}
          </h3>
          <ol className="ml-3 mt-3 flex flex-col gap-3 border-l-2 border-sand-300 pl-5">
            {entries.map((entry) => (
              <li key={entry.id} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[27px] top-6 size-3 rounded-full bg-gold-500 ring-4 ring-sand-50"
                />
                {getRecordHref ? (
                  <Link
                    href={getRecordHref(entry.id)}
                    className={`${ENTRY_CARD} transition-all hover:-translate-y-0.5 hover:border-sand-300 hover:shadow-md`}
                  >
                    <EntrySummary entry={entry} clampDescription />
                  </Link>
                ) : (
                  <div className={ENTRY_CARD}>
                    <EntrySummary entry={entry} />
                    {renderDetails?.(entry)}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

const CHIP = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold";

function EntrySummary({
  entry,
  clampDescription = false,
}: {
  entry: TimelineEntry;
  clampDescription?: boolean;
}) {
  const hasChips = entry.odometerDrop || entry.documentCount > 0 || entry.photoCount > 0;

  return (
    <>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="inline-flex items-center gap-1.5 text-ink-500">
          <Calendar aria-hidden className="size-3.5" />
          {formatDate(entry.serviceDate)}
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums text-ink-900">
          <Gauge aria-hidden className="size-4 text-gold-600" />
          {formatKm(entry.odometerKm)}
        </span>
      </div>
      <p className="mt-2 font-semibold text-ink-900">{entry.serviceName}</p>
      <p
        className={`mt-0.5 break-words text-ink-600 ${clampDescription ? "line-clamp-2" : "whitespace-pre-line"}`}
      >
        {entry.description}
      </p>
      {hasChips && (
        <p className="mt-3 flex flex-wrap gap-2">
          {entry.odometerDrop && (
            <span className={`${CHIP} bg-amber-100 text-amber-900`}>
              <TriangleAlert aria-hidden className="size-3.5" />
              Kilometre tutarsızlığı
            </span>
          )}
          {entry.documentCount > 0 && (
            <span className={`${CHIP} bg-sand-100 text-ink-700`}>
              <FileText aria-hidden className="size-3.5" />
              {`${entry.documentCount} belge`}
            </span>
          )}
          {entry.photoCount > 0 && (
            <span className={`${CHIP} bg-sand-100 text-ink-700`}>
              <Camera aria-hidden className="size-3.5" />
              {`${entry.photoCount} fotoğraf`}
            </span>
          )}
        </p>
      )}
    </>
  );
}
