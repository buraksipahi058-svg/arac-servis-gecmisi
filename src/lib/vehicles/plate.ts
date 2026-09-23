// Türkiye plakası: il kodu (01–81) + 1–3 harf + 2–4 rakam. DB'deki check constraint ile aynı kural.
const PLATE_PATTERN = /^(0[1-9]|[1-7][0-9]|8[01])([A-Z]{1,3})([0-9]{2,4})$/;

// "34 abc 123", "34-ABC-123" → "34ABC123"
// toUpperCase (tr değil) kullanılır: "i" → "I" olmalı, "İ" değil. Türkçe klavyedeki "İ" de "I" yapılır.
export function normalizePlate(input: string): string {
  return input.replace(/İ/g, "I").toUpperCase().replace(/[\s.-]/g, "");
}

export function isValidPlate(normalizedPlate: string): boolean {
  return PLATE_PATTERN.test(normalizedPlate);
}

// "34ABC123" → "34 ABC 123"
export function formatPlate(normalizedPlate: string): string {
  const match = PLATE_PATTERN.exec(normalizedPlate);
  return match ? `${match[1]} ${match[2]} ${match[3]}` : normalizedPlate;
}
