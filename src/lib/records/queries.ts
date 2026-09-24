import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";
import type { OdometerPoint } from "./odometer";
import { annotateOdometerDrops, toAttachmentCounts, type TimelineEntry } from "./timeline";

const RECORD_COLUMNS =
  "id, vehicle_id, service_date, odometer_km, service_name, description, entered_by, created_at, updated_at";

// Silinmemiş kayıtlar ve belge/fotoğraf sayıları; en yeni servis tarihi önce.
export async function listVehicleTimeline(vehicleId: string): Promise<TimelineEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_records")
    .select("id, service_date, created_at, odometer_km, service_name, description, record_documents(type)")
    .eq("vehicle_id", vehicleId)
    .is("deleted_at", null)
    .order("service_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return annotateOdometerDrops(
    data.map((record) => ({
      id: record.id,
      serviceDate: record.service_date,
      createdAt: record.created_at,
      odometerKm: record.odometer_km,
      serviceName: record.service_name,
      description: record.description,
      ...toAttachmentCounts(record.record_documents),
    })),
  );
}

// Km kontrolü için aracın silinmemiş kayıtlarının tarih/km değerleri.
export const listOdometerPoints = cache(async (vehicleId: string): Promise<OdometerPoint[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_records")
    .select("id, service_date, created_at, odometer_km")
    .eq("vehicle_id", vehicleId)
    .is("deleted_at", null);

  if (error) throw error;
  return data.map((record) => ({
    id: record.id,
    serviceDate: record.service_date,
    createdAt: record.created_at,
    odometerKm: record.odometer_km,
  }));
});

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

export type RecordAudit = Awaited<ReturnType<typeof listRecordAudits>>[number];
