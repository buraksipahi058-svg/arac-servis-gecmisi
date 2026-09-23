const APP_TIME_ZONE = "Europe/Istanbul";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: APP_TIME_ZONE,
});

const numberFormatter = new Intl.NumberFormat("tr-TR");

// "2025-03-12" → "12.03.2025". Saat dilimi kaymasını önlemek için tarih UTC olarak yorumlanır.
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}

// Zaman damgası (timestamptz) → "12.03.2025 14:05" (Türkiye saati)
export function formatDateTime(timestamp: string): string {
  return dateTimeFormatter.format(new Date(timestamp));
}

// 58700 → "58.700 km"
export function formatKm(km: number): string {
  return `${numberFormatter.format(km)} km`;
}

// Türkiye saatine göre bugünün tarihi: "2026-09-24"
export function todayIsoDate(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE }).format(new Date());
}
