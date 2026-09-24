import Link from "next/link";
import { formatDate, formatKm } from "@/lib/format";
import { attachmentLabels, type TimelineYear } from "@/lib/records/timeline";

type RecordTimelineProps = {
  years: TimelineYear[];
  getRecordHref: (recordId: string) => string;
};

// Servis kayıtları, yıllara göre gruplu ve en yeni önce.
export function RecordTimeline({ years, getRecordHref }: RecordTimelineProps) {
  return (
    <div className="flex flex-col gap-6">
      {years.map(({ year, entries }) => (
        <section key={year} aria-labelledby={`year-${year}`}>
          <h3 id={`year-${year}`} className="text-sm font-semibold text-gray-500">
            {year}
          </h3>
          <ol className="mt-2 flex flex-col gap-3 border-l-2 border-gray-200 pl-4">
            {entries.map((entry) => {
              const labels = attachmentLabels(entry);
              return (
                <li key={entry.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[23px] top-5 h-3 w-3 rounded-full border-2 border-white bg-gray-400"
                  />
                  <Link
                    href={getRecordHref(entry.id)}
                    className="block rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-baseline justify-between gap-3 text-sm text-gray-500">
                      <span>{formatDate(entry.serviceDate)}</span>
                      <span className="font-medium text-gray-700">{formatKm(entry.odometerKm)}</span>
                    </div>
                    <p className="mt-1 font-medium">{entry.serviceName}</p>
                    <p className="mt-0.5 line-clamp-2 text-gray-600">{entry.description}</p>
                    {(labels.length > 0 || entry.odometerDrop) && (
                      <p className="mt-2 flex flex-wrap gap-2">
                        {entry.odometerDrop && (
                          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                            Kilometre tutarsızlığı
                          </span>
                        )}
                        {labels.map((label) => (
                          <span
                            key={label}
                            className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                          >
                            {label}
                          </span>
                        ))}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
