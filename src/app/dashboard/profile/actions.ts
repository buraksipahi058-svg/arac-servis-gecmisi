"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  parseProfileForm,
  type ProfileFieldErrors,
  type ProfileFormValues,
} from "@/lib/profiles/validation";

export type ProfileFormState = {
  values?: ProfileFormValues;
  errors?: ProfileFieldErrors;
  formError?: string;
  saved?: boolean;
};

const GENERIC_ERROR = "Profil kaydedilemedi. Lütfen tekrar dene.";

export async function saveProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const { values, errors, data } = parseProfileForm(formData);
  if (!data) return { values, errors };

  const { supabase, user } = await requireUser("/dashboard/profile");
  const { titles, ...profile } = data;

  // Profil: varsa güncellenir, yoksa oluşturulur (user_id DB'de auth.uid() ile dolar).
  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (readError) {
    console.error("Profil okunamadı:", readError.code, readError.message);
    return { values, formError: GENERIC_ERROR };
  }

  const { error: saveError } = existing
    ? await supabase.from("profiles").update(profile).eq("user_id", user.id)
    : await supabase.from("profiles").insert(profile);
  if (saveError) {
    console.error("Profil kaydedilemedi:", saveError.code, saveError.message);
    return { values, formError: GENERIC_ERROR };
  }

  // Unvanlar: eklenenler eklenir, kaldırılanlar silinir (onları onaylayanların onayları da silinir).
  const { data: currentRows, error: titlesError } = await supabase
    .from("profile_titles")
    .select("title")
    .eq("user_id", user.id);
  if (titlesError) {
    console.error("Unvanlar okunamadı:", titlesError.code, titlesError.message);
    return { values, formError: GENERIC_ERROR };
  }

  const current = new Set(currentRows.map((row) => row.title));
  const toAdd = titles.filter((title) => !current.has(title));
  const toRemove = [...current].filter((title) => !titles.some((selected) => selected === title));

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from("profile_titles")
      .insert(toAdd.map((title) => ({ title })));
    if (error) {
      console.error("Unvan eklenemedi:", error.code, error.message);
      return { values, formError: GENERIC_ERROR };
    }
  }
  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("profile_titles")
      .delete()
      .eq("user_id", user.id)
      .in("title", toRemove);
    if (error) {
      console.error("Unvan kaldırılamadı:", error.code, error.message);
      return { values, formError: GENERIC_ERROR };
    }
  }

  revalidatePath("/dashboard", "layout");
  return { values, saved: true };
}
