import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { DOCUMENTS_BUCKET } from "./constants";
import { prepareFile } from "./prepare-file";

type DocumentInsert = Database["public"]["Tables"]["record_documents"]["Insert"];

export type UploadTarget = {
  userId: string;
  vehicleId: string;
  recordId: string;
};

export type UploadResult = {
  uploaded: number;
  failed: string[];
};

// Dosyaları tarayıcıdan doğrudan private bucket'a yükler ve record_documents'a kaydeder.
// Yetki Storage ve tablo RLS'i ile kontrol edilir. Dosyalar sırayla yüklenir (mobil bağlantı).
export async function uploadRecordDocuments(
  supabase: SupabaseClient<Database>,
  target: UploadTarget,
  files: File[],
): Promise<UploadResult> {
  const result: UploadResult = { uploaded: 0, failed: [] };

  for (const file of files) {
    try {
      const prepared = await prepareFile(file);
      const storagePath = `${target.userId}/${target.vehicleId}/${target.recordId}/${randomId()}.${prepared.extension}`;

      const { error: uploadError } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .upload(storagePath, prepared.blob, { contentType: prepared.contentType, upsert: false });
      if (uploadError) throw uploadError;

      // mime_type ve file_size istemciden gönderilmez (yetkisi de yok); DB trigger'ı bunları
      // depodaki nesneden doldurur. Üretilen tipler bunu bilmediği için dönüşüm gerekiyor.
      const row = {
        record_id: target.recordId,
        storage_path: storagePath,
        file_name: prepared.fileName,
      } as DocumentInsert;
      const { error: insertError } = await supabase.from("record_documents").insert(row);
      if (insertError) {
        // Kayda bağlanamayan dosya depoda sahipsiz kalmasın.
        await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
        throw insertError;
      }

      result.uploaded += 1;
    } catch (error) {
      console.error(`Yüklenemedi: ${file.name}`, error);
      result.failed.push(file.name);
    }
  }

  return result;
}

// crypto.randomUUID yalnızca güvenli bağlamda (HTTPS/localhost) var; LAN üzerinden HTTP ile
// telefondan erişimde de çalışsın diye getRandomValues ile UUID v4 üretilir.
function randomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
