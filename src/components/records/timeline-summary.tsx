import { formatKm } from "@/lib/format";
import type { TimelineSummary as Summary } from "@/lib/records/timeline";

// Yalnızca sayısal özet; araç hakkında yorum veya hüküm içermez.
export function TimelineSummary({ summary }: { summary: Summary }) {
  if (summary.recordCount === 0) return null;

  return (
    <ul className="flex flex-col gap-1 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-700">
      <li>{`${summary.recordCount} servis kaydı bulundu.`}</li>
      <li>{`${summary.recordsWithAttachments} kayıtta belge veya fotoğraf bulunuyor.`}</li>
      {summary.latestKm !== null && (
        <li>{`Son kayıt ${formatKm(summary.latestKm)}'de oluşturulmuş.`}</li>
      )}
    </ul>
  );
}
