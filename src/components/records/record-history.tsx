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
    <section className="mt-8">
      <h2 className="text-base font-semibold">Değişiklik geçmişi</h2>
      <ol className="mt-3 flex flex-col gap-3 border-l border-gray-200 pl-4">
        {audits.map((audit) => {
          const { title, changes } = describeAudit(audit);
          return (
            <li key={audit.id} className="text-sm">
              <p className="font-medium text-gray-800">{title}</p>
              <p className="text-gray-500">{formatDateTime(audit.created_at)}</p>
              {changes.length > 0 && (
                <ul className="mt-1 flex flex-col gap-0.5 text-gray-600">
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
