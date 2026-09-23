"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PostgrestError } from "@supabase/supabase-js";
import type { ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import { isUuid } from "@/lib/uuid";
import {
  parseVehicleForm,
  type VehicleFieldErrors,
  type VehicleFormValues,
} from "@/lib/vehicles/validation";

export type VehicleFormState = {
  values?: VehicleFormValues;
  errors?: VehicleFieldErrors;
  formError?: string;
};

const NOT_FOUND_MESSAGE = "Araç bulunamadı.";

function dbErrorState(error: PostgrestError): Pick<VehicleFormState, "errors" | "formError"> {
  if (error.code === "23505") {
    return { errors: { plate: "Bu plakayla kayıtlı bir aracın zaten var." } };
  }
  console.error("Araç kaydı başarısız:", error);
  return { formError: "Araç kaydedilemedi. Lütfen tekrar dene." };
}

export async function createVehicle(
  _prevState: VehicleFormState,
  formData: FormData,
): Promise<VehicleFormState> {
  const { values, errors, data } = parseVehicleForm(formData);
  if (!data) return { values, errors };

  const { supabase } = await requireUser("/dashboard/vehicles/new");
  // owner_id gönderilmez; DB'de auth.uid() ile doldurulur ve RLS ile doğrulanır.
  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .insert(data)
    .select("id")
    .single();

  if (error) return { values, ...dbErrorState(error) };

  revalidatePath("/dashboard");
  redirect(`/dashboard/vehicles/${vehicle.id}`);
}

export async function updateVehicle(
  vehicleId: string,
  _prevState: VehicleFormState,
  formData: FormData,
): Promise<VehicleFormState> {
  const { values, errors, data } = parseVehicleForm(formData);
  if (!data) return { values, errors };
  if (!isUuid(vehicleId)) return { values, formError: NOT_FOUND_MESSAGE };

  const { supabase } = await requireUser(`/dashboard/vehicles/${vehicleId}/edit`);
  const { data: updated, error } = await supabase
    .from("vehicles")
    .update(data)
    .eq("id", vehicleId)
    .select("id")
    .maybeSingle();

  if (error) return { values, ...dbErrorState(error) };
  // RLS: başka kullanıcının aracıysa hiçbir satır güncellenmez.
  if (!updated) return { values, formError: NOT_FOUND_MESSAGE };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/vehicles/${vehicleId}`);
  redirect(`/dashboard/vehicles/${vehicleId}`);
}

export async function deleteVehicle(
  vehicleId: string,
  _prevState: ActionState,
): Promise<ActionState> {
  if (!isUuid(vehicleId)) return { error: NOT_FOUND_MESSAGE };

  const { supabase } = await requireUser();
  const { error } = await supabase.from("vehicles").delete().eq("id", vehicleId);

  if (error) {
    // FK (on delete restrict): servis kaydı olan araç silinemez.
    if (error.code === "23503") {
      return { error: "Servis kaydı olan araç silinemez." };
    }
    console.error("Araç silinemedi:", error);
    return { error: "Araç silinemedi. Lütfen tekrar dene." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
