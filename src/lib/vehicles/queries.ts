import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";

export const VEHICLE_COLUMNS = "id, plate, make, model, model_year";

// Aynı istekte generateMetadata ve sayfa aynı aracı istediğinde tek sorgu yapılır.
// RLS sayesinde başka kullanıcının aracı için null döner.
export const getOwnVehicle = cache(async (vehicleId: string) => {
  if (!isUuid(vehicleId)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select(VEHICLE_COLUMNS)
    .eq("id", vehicleId)
    .maybeSingle();

  if (error) throw error;
  return data;
});

export type VehicleSummary = NonNullable<Awaited<ReturnType<typeof getOwnVehicle>>>;

export type VehicleOverview = VehicleSummary & {
  recordCount: number;
  // En yeni tarihli (silinmemiş) kaydın kilometresi.
  latestKm: number | null;
};

// Dashboard kartları için araçlar + silinmemiş kayıt sayısı ve son kaydın km'si.
export async function listOwnVehicles(): Promise<VehicleOverview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select(`${VEHICLE_COLUMNS}, service_records(service_date, odometer_km, created_at)`)
    .is("service_records.deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map(({ service_records: records, ...vehicle }) => {
    const latest = records.reduce<(typeof records)[number] | null>(
      (newest, record) =>
        !newest ||
        record.service_date > newest.service_date ||
        (record.service_date === newest.service_date && record.created_at > newest.created_at)
          ? record
          : newest,
      null,
    );
    return { ...vehicle, recordCount: records.length, latestKm: latest?.odometer_km ?? null };
  });
}
