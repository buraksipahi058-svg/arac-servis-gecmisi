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

export async function listOwnVehicles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select(VEHICLE_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export type VehicleSummary = NonNullable<Awaited<ReturnType<typeof getOwnVehicle>>>;
