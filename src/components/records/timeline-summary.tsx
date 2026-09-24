import { ClipboardList, Gauge, Paperclip, TriangleAlert } from "lucide-react";
import { cardClass } from "@/components/ui/card";
import { formatKm } from "@/lib/format";
import type { TimelineSummary as Summary } from "@/lib/records/timeline";

const ITEM = "flex items-start gap-2.5";
const ICON = "mt-0.5 size-4 shrink-0";

// Yalnızca sayısal özet; araç hakkında yorum veya hüküm içermez.
export function TimelineSummary({ summary }: { summary: Summary }) {
  if (summary.recordCount === 0) return null;

  return (
    <ul
      className={`${cardClass} flex flex-col gap-2 border-l-4 border-l-gold-400 px-4 py-3.5 text-sm text-ink-700`}
    >
      <li className={ITEM}>
        <ClipboardList aria-hidden className={`${ICON} text-ink-400`} />
        {`${summary.recordCount} servis kaydı bulundu.`}
      </li>
      <li className={ITEM}>
        <Paperclip aria-hidden className={`${ICON} text-ink-400`} />
        {summary.recordsWithAttachments === 0
          ? "Hiçbir kayıtta belge veya fotoğraf bulunmuyor."
          : `${summary.recordsWithAttachments} kayıtta belge veya fotoğraf bulunuyor.`}
      </li>
      {summary.odometerDropCount > 0 && (
        <li className={`${ITEM} font-semibold text-amber-800`}>
          <TriangleAlert aria-hidden className={ICON} />
          {`${summary.odometerDropCount} kayıtta, bir önceki kayda göre kilometre düşüşü tespit edildi.`}
        </li>
      )}
      {summary.latestKm !== null && (
        <li className={ITEM}>
          <Gauge aria-hidden className={`${ICON} text-ink-400`} />
          {`Son kayıt ${formatKm(summary.latestKm)}'de oluşturulmuş.`}
        </li>
      )}
    </ul>
  );
}
