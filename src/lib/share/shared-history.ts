import "server-only";
import { DOCUMENTS_BUCKET, SIGNED_URL_TTL_SECONDS } from "@/lib/documents/constants";
import type { RecordDocument } from "@/lib/documents/queries";
import { annotateOdometerDrops, toAttachmentCounts, type TimelineEntry } from "@/lib/records/timeline";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ShareAccess } from "./access";

// Paylaşım görünümünde gösterilen alanlar (whitelist). Sahibin kimliği/e-postası, kayıt ve
// belge ID'leri, dosya adları ve depolama yolları bu yapıya girmez.
export type SharedEntry = TimelineEntry & {
  enteredBy: string;
  // Kayıt oluşturulduktan sonra en az bir kez düzenlenmiş mi (değişiklik geçmişinden).
  edited: boolean;
  documents: RecordDocument[];
};

export type SharedHistory = {
  vehicle: { plate: string; make: string; model: string; modelYear: number; vehicleType: string };
  expiresAt: string;
  entries: SharedEntry[];
};

export async function loadSharedHistory(access: ShareAccess): Promise<SharedHistory> {
  const admin = createAdminClient();

  const [vehicleResult, recordsResult] = await Promise.all([
    admin
      .from("vehicles")
      .select("plate, make, model, model_year, vehicle_type")
      .eq("id", access.vehicleId)
      .single(),
    admin
      .from("service_records")
      .select(
        "service_date, created_at, odometer_km, service_name, description, entered_by, record_documents(type, file_size, storage_path, created_at), service_record_audits(action)",
      )
      .eq("vehicle_id", access.vehicleId)
      .is("deleted_at", null)
      .eq("service_record_audits.action", "update")
      .order("service_date", { ascending: false })
      .order("created_at", { ascending: false })
      .order("created_at", { referencedTable: "record_documents", ascending: true }),
  ]);
  if (vehicleResult.error) throw vehicleResult.error;
  if (recordsResult.error) throw recordsResult.error;

  const records = recordsResult.data;
  const paths = records.flatMap((record) => record.record_documents.map((d) => d.storage_path));
  const urlByPath = new Map<string, string>();
  if (paths.length > 0) {
    // Belgeler kısa ömürlü signed URL ile gösterilir (bucket private).
    const { data: signed, error } = await admin.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
    if (error) throw error;
    for (const item of signed) {
      if (item.path && item.signedUrl) urlByPath.set(item.path, item.signedUrl);
    }
  }

  const entries = annotateOdometerDrops(
    records.map((record, recordIndex) => {
      let photoNumber = 0;
      let documentNumber = 0;
      const documents: RecordDocument[] = record.record_documents.map((document, documentIndex) => {
        const isPdf = document.type === "document";
        return {
          id: `belge-${recordIndex}-${documentIndex}`,
          // Dosya adı kişisel bilgi içerebileceği için gösterilmez.
          fileName: isPdf ? `Belge ${++documentNumber}` : `Fotoğraf ${++photoNumber}`,
          type: isPdf ? "document" : "photo",
          fileSize: document.file_size,
          url: urlByPath.get(document.storage_path) ?? null,
        };
      });

      return {
        id: `kayit-${recordIndex}`,
        serviceDate: record.service_date,
        createdAt: record.created_at,
        odometerKm: record.odometer_km,
        serviceName: record.service_name,
        description: record.description,
        enteredBy: record.entered_by,
        edited: record.service_record_audits.length > 0,
        documents,
        ...toAttachmentCounts(record.record_documents),
      };
    }),
  );

  const vehicle = vehicleResult.data;
  return {
    vehicle: {
      plate: vehicle.plate,
      make: vehicle.make,
      model: vehicle.model,
      modelYear: vehicle.model_year,
      vehicleType: vehicle.vehicle_type,
    },
    expiresAt: access.expiresAt,
    entries,
  };
}
