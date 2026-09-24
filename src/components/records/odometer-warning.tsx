import { FormAlert } from "@/components/ui/form-alert";
import { formatDate, formatKm } from "@/lib/format";
import type { OdometerReference } from "@/lib/records/odometer";

function describe(reference: OdometerReference): string {
  return `${formatDate(reference.serviceDate)} · ${formatKm(reference.odometerKm)}`;
}

// Kayıt detayında: kaydedilmiş bir kaydın km'si önceki kayıttan düşük.
export function RecordOdometerWarning({
  odometerKm,
  previous,
}: {
  odometerKm: number;
  previous: OdometerReference;
}) {
  return (
    <FormAlert tone="warning">
      <span className="font-medium">Kilometre tutarsızlığı: </span>
      {`Bu kayıttaki kilometre (${formatKm(odometerKm)}), tarih sırasına göre bir önceki kayıttan (${describe(previous)}) daha düşük.`}
    </FormAlert>
  );
}

// Formda: kaydedilmeden önce uyarır, kaydetmeyi engellemez.
export function OdometerInputWarning({
  lowerThanPrevious,
  higherThanNext,
}: {
  lowerThanPrevious: OdometerReference | null;
  higherThanNext: OdometerReference | null;
}) {
  if (!lowerThanPrevious && !higherThanNext) return null;

  return (
    <FormAlert tone="warning">
      {lowerThanPrevious &&
        `Kilometre değeri önceki kayda göre daha düşük (${describe(lowerThanPrevious)}). `}
      {higherThanNext &&
        `Kilometre değeri, daha sonraki tarihli kayıttan yüksek (${describe(higherThanNext)}). `}
      Kayıt yine de kaydedilebilir; kayıt üzerinde kilometre tutarsızlığı uyarısı gösterilir.
    </FormAlert>
  );
}
