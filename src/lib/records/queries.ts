import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";

const RECORD_COLUMNS =
  "id, vehicle_id, service_date, odometer_km, service_name, description, entered_by, created_at, updated_at";

// Silinmemiş kayıtlar; en yeni servis tarihi önce.
export async function listVehicleRecords(vehicleId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_records")
    .select(RECORD_COLUMNS)
    .eq("vehicle_id", vehicleId)
    .is("deleted_at", null)
    .order("service_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export const getVehicleRecord = cache(async (vehicleId: string, recordId: string) => {
  if (!isUuid(vehicleId) || !isUuid(recordId)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_records")
    .select(RECORD_COLUMNS)
    .eq("id", recordId)
    .eq("vehicle_id", vehicleId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  return data;
});

export async function listRecordAudits(recordId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_record_audits")
    .select("id, action, old_values, new_values, created_at")
    .eq("record_id", recordId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

// Silinmiş kayıtlar dahil: bu sayı > 0 ise araç silinemez (DB'de FK ile de korunur).
export async function countAllVehicleRecords(vehicleId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("service_records")
    .select("id", { count: "exact", head: true })
    .eq("vehicle_id", vehicleId);

  if (error) throw error;
  return count ?? 0;
}

export type ServiceRecord = NonNullable<Awaited<ReturnType<typeof getVehicleRecord>>>;
export type RecordAudit = Awaited<ReturnType<typeof listRecordAudits>>[number];
