import "server-only";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENTS_BUCKET, SIGNED_URL_TTL_SECONDS } from "./constants";

export type RecordDocument = {
  id: string;
  fileName: string;
  type: "photo" | "document";
  fileSize: number;
  // Kısa ömürlü signed URL; dosya depoda yoksa null.
  url: string | null;
};

export async function listRecordDocuments(recordId: string): Promise<RecordDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("record_documents")
    .select("id, file_name, type, file_size, storage_path")
    .eq("record_id", recordId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (data.length === 0) return [];

  // Signed URL üretimi de kullanıcının yetkisiyle yapılır (Storage RLS).
  const { data: signed, error: signError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrls(
      data.map((document) => document.storage_path),
      SIGNED_URL_TTL_SECONDS,
    );
  if (signError) throw signError;

  const urlByPath = new Map(signed.map((item) => [item.path, item.signedUrl]));

  return data.map((document) => ({
    id: document.id,
    fileName: document.file_name,
    type: document.type === "document" ? "document" : "photo",
    fileSize: document.file_size,
    url: urlByPath.get(document.storage_path) ?? null,
  }));
}
