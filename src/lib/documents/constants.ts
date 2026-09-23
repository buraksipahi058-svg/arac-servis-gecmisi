// Sunucu ve istemci tarafından paylaşılan belge ayarları.
// Aynı sınırlar DB'de (record_documents) ve Storage bucket ayarında da uygulanır.
export const DOCUMENTS_BUCKET = "record-documents";

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const PDF_MIME_TYPE = "application/pdf";
export const ALLOWED_MIME_TYPES: readonly string[] = [...IMAGE_MIME_TYPES, PDF_MIME_TYPE];
export const ACCEPT_ATTRIBUTE = ALLOWED_MIME_TYPES.join(",");

export const MAX_DOCUMENTS_PER_RECORD = 10;
export const MAX_STORED_FILE_BYTES = 10 * 1024 * 1024;
// Telefon fotoğrafları sıkıştırılmadan önce bu boyuta kadar kabul edilir.
export const MAX_IMAGE_INPUT_BYTES = 25 * 1024 * 1024;
export const IMAGE_MAX_DIMENSION = 1600;

export const SIGNED_URL_TTL_SECONDS = 10 * 60;
