"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PostgrestError } from "@supabase/supabase-js";
import type { ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import { DOCUMENTS_BUCKET } from "@/lib/documents/constants";
import {
  parseRecordForm,
  type RecordFieldErrors,
  type RecordFormValues,
} from "@/lib/records/validation";
import { isUuid } from "@/lib/uuid";

export type RecordFormState = {
  values?: RecordFormValues;
  errors?: RecordFieldErrors;
  formError?: string;
  // Belge seçildiyse kayıt oluşturulur, yönlendirme yerine ID döner; istemci belgeleri yükler.
  createdRecordId?: string;
};

const RECORD_NOT_FOUND = "Kayıt bulunamadı veya düzenlenemez.";
const DOCUMENT_NOT_FOUND = "Belge bulunamadı veya kaldırılamaz.";

function vehiclePath(vehicleId: string) {
  return `/dashboard/vehicles/${vehicleId}`;
}

function logAndGenericError(context: string, error: PostgrestError): string {
  console.error(context, error);
  return "İşlem tamamlanamadı. Lütfen tekrar dene.";
}

function revalidateVehicle(vehicleId: string) {
  revalidatePath("/dashboard");
  revalidatePath(vehiclePath(vehicleId));
}

export async function createRecord(
  vehicleId: string,
  _prevState: RecordFormState,
  formData: FormData,
): Promise<RecordFormState> {
  const { values, errors, data } = parseRecordForm(formData);
  if (!data) return { values, errors };
  if (!isUuid(vehicleId)) return { values, formError: "Araç bulunamadı." };
  const hasDocuments = formData.get("hasDocuments") === "1";

  const { supabase } = await requireUser(`${vehiclePath(vehicleId)}/records/new`);
  // entered_by DB'de 'owner' olarak atanır; istemci değiştiremez.
  const { data: record, error } = await supabase
    .from("service_records")
    .insert({ vehicle_id: vehicleId, ...data })
    .select("id")
    .single();

  if (error) {
    // RLS: araç bu kullanıcıya ait değilse ekleme reddedilir.
    if (error.code === "42501") return { values, formError: "Araç bulunamadı." };
    return { values, formError: logAndGenericError("Servis kaydı eklenemedi:", error) };
  }

  revalidateVehicle(vehicleId);
  if (hasDocuments) return { values, createdRecordId: record.id };
  redirect(`${vehiclePath(vehicleId)}/records/${record.id}`);
}

export async function updateRecord(
  vehicleId: string,
  recordId: string,
  _prevState: RecordFormState,
  formData: FormData,
): Promise<RecordFormState> {
  const { values, errors, data } = parseRecordForm(formData);
  if (!data) return { values, errors };
  if (!isUuid(vehicleId) || !isUuid(recordId)) return { values, formError: RECORD_NOT_FOUND };

  const { supabase } = await requireUser(`${vehiclePath(vehicleId)}/records/${recordId}/edit`);
  // Önceki/yeni değerler DB trigger'ı ile service_record_audits tablosuna yazılır.
  const { data: updated, error } = await supabase
    .from("service_records")
    .update(data)
    .eq("id", recordId)
    .eq("vehicle_id", vehicleId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) return { values, formError: logAndGenericError("Servis kaydı güncellenemedi:", error) };
  if (!updated) return { values, formError: RECORD_NOT_FOUND };

  revalidateVehicle(vehicleId);
  revalidatePath(`${vehiclePath(vehicleId)}/records/${recordId}`);
  redirect(`${vehiclePath(vehicleId)}/records/${recordId}`);
}

// Soft delete: kayıt veritabanında kalır, listelerde gösterilmez, değiştirilemez.
export async function deleteRecord(
  vehicleId: string,
  recordId: string,
  _prevState: ActionState,
): Promise<ActionState> {
  if (!isUuid(vehicleId) || !isUuid(recordId)) return { error: RECORD_NOT_FOUND };

  const { supabase } = await requireUser();
  const { data: deleted, error } = await supabase
    .from("service_records")
    // Silme zamanını DB trigger'ı now() ile belirler.
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", recordId)
    .eq("vehicle_id", vehicleId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) return { error: logAndGenericError("Servis kaydı silinemedi:", error) };
  if (!deleted) return { error: RECORD_NOT_FOUND };

  revalidateVehicle(vehicleId);
  redirect(vehiclePath(vehicleId));
}

// Önce dosya depodan kaldırılır (kişisel veri içerebilir), sonra kayıt silinir.
// Satır silme başarısız olursa işlem tekrar denenebilir; eksik dosyayı kaldırmak hata vermez.
export async function deleteDocument(
  vehicleId: string,
  recordId: string,
  documentId: string,
  _prevState: ActionState,
): Promise<ActionState> {
  if (![vehicleId, recordId, documentId].every(isUuid)) return { error: DOCUMENT_NOT_FOUND };

  const { supabase } = await requireUser();
  const { data: document, error } = await supabase
    .from("record_documents")
    .select("id, storage_path")
    .eq("id", documentId)
    .eq("record_id", recordId)
    .maybeSingle();

  if (error) return { error: logAndGenericError("Belge okunamadı:", error) };
  if (!document) return { error: DOCUMENT_NOT_FOUND };

  const { error: removeError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .remove([document.storage_path]);
  if (removeError) {
    console.error("Belge dosyası kaldırılamadı:", removeError);
    return { error: DOCUMENT_NOT_FOUND };
  }

  const { data: deleted, error: deleteError } = await supabase
    .from("record_documents")
    .delete()
    .eq("id", document.id)
    .select("id")
    .maybeSingle();

  if (deleteError) return { error: logAndGenericError("Belge kaydı silinemedi:", deleteError) };
  if (!deleted) return { error: DOCUMENT_NOT_FOUND };

  revalidateVehicle(vehicleId);
  revalidatePath(`${vehiclePath(vehicleId)}/records/${recordId}`);
  return {};
}
