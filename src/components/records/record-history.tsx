import { History } from "lucide-react";
import { cardClass } from "@/components/ui/card";
import type { Json } from "@/lib/supabase/database.types";
import { formatDate, formatDateTime, formatKm } from "@/lib/format";
import type { RecordAudit } from "@/lib/records/queries";

const FIELD_LABELS: Record<string, string> = {
  service_date: "Tarih",
  odometer_km: "Kilometre",
  service_name: "Servis",
  description: "İşlem açıklaması",
};

function asObject(value: Json | null): Record<string, Json | undefined> {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function formatFieldValue(field: string, value: Json | undefined): string {
  if (value === null || value === undefined) return "—";
  if (field === "service_date" && typeof value === "string") return formatDate(value);
  if (field === "odometer_km" && typeof value === "number") return formatKm(value);
  return String(value);
}

function describeAudit(audit: RecordAudit): { title: string; changes: string[] } {
  if (audit.action === "insert") return { title: "Kayıt oluşturuldu", changes: [] };
  if (audit.action === "soft_delete") return { title: "Kayıt silindi", changes: [] };
  if (audit.action === "document_added" || audit.action === "document_removed") {
    const values = asObject(audit.action === "document_added" ? audit.new_values : audit.old_values);
    const noun = values.type === "document" ? "Belge" : "Fotoğraf";
    const verb = audit.action === "document_added" ? "eklendi" : "kaldırıldı";
    return { title: `${noun} ${verb}`, changes: [String(values.file_name ?? "")] };
  }

  const oldValues = asObject(audit.old_values);
  const newValues = asObject(audit.new_values);
  const changes = Object.keys(newValues)
    .filter((field) => field in FIELD_LABELS)
    .map(
      (field) =>
        `${FIELD_LABELS[field]}: ${formatFieldValue(field, oldValues[field])} → ${formatFieldValue(field, newValues[field])}`,
    );

  return { title: "Kayıt düzenlendi", changes };
}

// Kaydın değişiklik geçmişi (DB trigger'ı ile tutulan audit kayıtları).
export function RecordHistory({ audits }: { audits: RecordAudit[] }) {
  if (audits.length === 0) return null;

  return (
    <section className={`${cardClass} mt-5 p-5 sm:p-6`}>
      <h2 className="flex items-center gap-2 text-base font-bold">
        <History aria-hidden className="size-4 text-gold-600" />
        Değişiklik geçmişi
      </h2>
      <ol className="ml-1.5 mt-4 flex flex-col gap-4 border-l-2 border-sand-200 pl-4">
        {audits.map((audit) => {
          const { title, changes } = describeAudit(audit);
          return (
            <li key={audit.id} className="relative text-sm">
              <span
                aria-hidden
                className="absolute -left-[23px] top-1.5 size-2.5 rounded-full bg-gold-500 ring-4 ring-white"
              />
              <p className="font-semibold text-ink-800">{title}</p>
              <p className="text-ink-500">{formatDateTime(audit.created_at)}</p>
              {changes.length > 0 && (
                <ul className="mt-1 flex flex-col gap-0.5 text-ink-600">
                  {changes.map((change) => (
                    <li key={change} className="break-words">
                      {change}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
