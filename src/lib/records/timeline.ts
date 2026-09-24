// Zaman çizelgesi verisi: sahibin araç sayfası ve (ileride) paylaşım görünümü için ortak.
// Sunucuya bağımlı değildir; yalnızca veriyi gruplar ve sayar, yorum yapmaz.

export type TimelineEntry = {
  id: string;
  serviceDate: string;
  odometerKm: number;
  serviceName: string;
  description: string;
  documentCount: number;
  photoCount: number;
};

export type TimelineYear = {
  year: string;
  entries: TimelineEntry[];
};

export type TimelineSummary = {
  recordCount: number;
  recordsWithAttachments: number;
  latestKm: number | null;
};

type DocumentTypeRow = { type: string };

export function toAttachmentCounts(documents: DocumentTypeRow[]) {
  const documentCount = documents.filter((document) => document.type === "document").length;
  return { documentCount, photoCount: documents.length - documentCount };
}

// Girdi en yeni kayıt önce sıralı olmalı; yıllar da aynı sırayla döner.
export function groupByYear(entries: TimelineEntry[]): TimelineYear[] {
  const years: TimelineYear[] = [];
  for (const entry of entries) {
    const year = entry.serviceDate.slice(0, 4);
    const current = years.at(-1);
    if (current?.year === year) {
      current.entries.push(entry);
    } else {
      years.push({ year, entries: [entry] });
    }
  }
  return years;
}

export function summarizeTimeline(entries: TimelineEntry[]): TimelineSummary {
  return {
    recordCount: entries.length,
    recordsWithAttachments: entries.filter((entry) => entry.documentCount + entry.photoCount > 0)
      .length,
    // En yeni tarihli kaydın kilometresi (en yüksek km değil).
    latestKm: entries[0]?.odometerKm ?? null,
  };
}

// "2 belge", "1 fotoğraf"
export function attachmentLabels(entry: Pick<TimelineEntry, "documentCount" | "photoCount">) {
  const labels: string[] = [];
  if (entry.documentCount > 0) labels.push(`${entry.documentCount} belge`);
  if (entry.photoCount > 0) labels.push(`${entry.photoCount} fotoğraf`);
  return labels;
}
