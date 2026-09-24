// Kilometre tutarlılık kontrolü. DB'ye yazılmaz; her okumada kayıtların tarih sırasına göre
// hesaplanır. Sunucu ve istemci (form uyarısı) tarafından ortak kullanılır.
// Yalnızca sayısal bir tespit yapar; kaydın doğru/yanlış olduğuna hüküm vermez.

export type OdometerPoint = {
  id: string;
  serviceDate: string;
  createdAt: string;
  odometerKm: number;
};

export type OdometerReference = {
  serviceDate: string;
  odometerKm: number;
};

// Tarih sırası: servis tarihi, aynı gün ise önce oluşturulan önce.
function compareChronologically(a: OdometerPoint, b: OdometerPoint): number {
  if (a.serviceDate !== b.serviceDate) return a.serviceDate < b.serviceDate ? -1 : 1;
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
  return 0;
}

// Kilometresi, tarih sırasına göre bir önceki kayıttan düşük olan kayıtlar
// → kayıt ID'si: o önceki kayıt.
export function findOdometerDrops(points: OdometerPoint[]): Map<string, OdometerReference> {
  const drops = new Map<string, OdometerReference>();
  const ordered = [...points].sort(compareChronologically);

  for (let index = 1; index < ordered.length; index++) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    if (current.odometerKm < previous.odometerKm) {
      drops.set(current.id, { serviceDate: previous.serviceDate, odometerKm: previous.odometerKm });
    }
  }
  return drops;
}

// Kaydedilmemiş (yeni ya da düzenlenen) bir değerin mevcut kayıtlara göre konumu.
// Aynı tarihli mevcut kayıtlar, bu değerden önce girilmiş sayılır.
export function checkOdometerValue(
  points: OdometerPoint[],
  serviceDate: string,
  odometerKm: number,
): { lowerThanPrevious: OdometerReference | null; higherThanNext: OdometerReference | null } {
  const ordered = [...points].sort(compareChronologically);
  const previous = ordered.filter((point) => point.serviceDate <= serviceDate).at(-1);
  const next = ordered.find((point) => point.serviceDate > serviceDate);

  return {
    lowerThanPrevious:
      previous && odometerKm < previous.odometerKm
        ? { serviceDate: previous.serviceDate, odometerKm: previous.odometerKm }
        : null,
    higherThanNext:
      next && odometerKm > next.odometerKm
        ? { serviceDate: next.serviceDate, odometerKm: next.odometerKm }
        : null,
  };
}
