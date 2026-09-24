"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import { isProfileTitle } from "@/lib/profiles/titles";
import { isUuid } from "@/lib/uuid";

function profilePath(userId: string) {
  return `/dashboard/users/${userId}`;
}

// Başka bir kullanıcının unvanını onaylar. Onaylayan kişi DB'de auth.uid() ile belirlenir.
export async function endorseTitle(
  holderId: string,
  title: string,
  _prevState: ActionState,
): Promise<ActionState> {
  if (!isUuid(holderId) || !isProfileTitle(title)) return { error: "Unvan bulunamadı." };

  const { supabase, user } = await requireUser(profilePath(holderId));
  if (user.id === holderId) return { error: "Kendi unvanını onaylayamazsın." };

  const { data: ownProfile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError) {
    console.error("Profil okunamadı:", profileError.code, profileError.message);
    return { error: "Onay verilemedi. Lütfen tekrar dene." };
  }
  if (!ownProfile) return { error: "Onay verebilmek için önce profilini oluştur." };

  const { error } = await supabase.from("title_endorsements").insert({ holder_id: holderId, title });
  // 23505: zaten onaylamış; sonuç aynı.
  if (error && error.code !== "23505") {
    if (error.code === "23503") return { error: "Bu unvan artık kullanıcının profilinde yok." };
    console.error("Onay verilemedi:", error.code, error.message);
    return { error: "Onay verilemedi. Lütfen tekrar dene." };
  }

  revalidatePath(profilePath(holderId));
  revalidatePath("/dashboard/users");
  return {};
}

// Kullanıcı yalnızca kendi verdiği onayı geri alabilir (RLS).
export async function withdrawEndorsement(
  holderId: string,
  title: string,
  _prevState: ActionState,
): Promise<ActionState> {
  if (!isUuid(holderId) || !isProfileTitle(title)) return { error: "Unvan bulunamadı." };

  const { supabase, user } = await requireUser(profilePath(holderId));
  const { error } = await supabase
    .from("title_endorsements")
    .delete()
    .eq("holder_id", holderId)
    .eq("title", title)
    .eq("endorser_id", user.id);

  if (error) {
    console.error("Onay geri alınamadı:", error.code, error.message);
    return { error: "Onay geri alınamadı. Lütfen tekrar dene." };
  }

  revalidatePath(profilePath(holderId));
  revalidatePath("/dashboard/users");
  return {};
}
