const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// URL'den gelen ID'yi sorguya vermeden önce biçimini doğrular (geçersiz UUID Postgres hatasına yol açar).
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
