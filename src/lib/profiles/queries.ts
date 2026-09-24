import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";
import { compareProfileTitles, isProfileTitle, type ProfileTitle } from "./titles";

const MAX_SEARCH_RESULTS = 50;

export const getProfile = cache(async (userId: string) => {
  if (!isUuid(userId)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, display_name, city, phone, bio, created_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
});

export type Profile = NonNullable<Awaited<ReturnType<typeof getProfile>>>;

export type Endorser = { userId: string; displayName: string; createdAt: string };
export type TitleWithEndorsers = { title: ProfileTitle; endorsers: Endorser[] };

// Kullanıcının unvanları ve her unvanı onaylayanlar (en yeni önce).
export async function listTitlesWithEndorsers(userId: string): Promise<TitleWithEndorsers[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_titles")
    .select(
      "title, created_at, title_endorsements(endorser_id, created_at, endorser:profiles!title_endorsements_endorser_id_fkey(display_name))",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data
    .filter((row) => isProfileTitle(row.title))
    .map((row) => ({
      title: row.title as ProfileTitle,
      endorsers: row.title_endorsements
        .map((endorsement) => ({
          userId: endorsement.endorser_id,
          displayName: endorsement.endorser?.display_name ?? "",
          createdAt: endorsement.created_at,
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }))
    .sort((a, b) => compareProfileTitles(a.title, b.title));
}

export type GivenEndorsement = {
  holderId: string;
  holderName: string;
  title: ProfileTitle;
  createdAt: string;
};

// Kullanıcının başkalarına verdiği onaylar (en yeni önce).
export async function listEndorsementsGiven(userId: string): Promise<GivenEndorsement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("title_endorsements")
    .select("holder_id, title, created_at")
    .eq("endorser_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (data.length === 0) return [];

  const holderIds = [...new Set(data.map((row) => row.holder_id))];
  const { data: holders, error: holderError } = await supabase
    .from("profiles")
    .select("user_id, display_name")
    .in("user_id", holderIds);
  if (holderError) throw holderError;

  const nameById = new Map(holders.map((holder) => [holder.user_id, holder.display_name]));
  return data
    .filter((row) => isProfileTitle(row.title))
    .map((row) => ({
      holderId: row.holder_id,
      holderName: nameById.get(row.holder_id) ?? "",
      title: row.title as ProfileTitle,
      createdAt: row.created_at,
    }));
}

export type ProfileSearchResult = {
  userId: string;
  displayName: string;
  city: string | null;
  titles: { title: ProfileTitle; endorsementCount: number }[];
};

// LIKE joker karakterleri kullanıcı girdisinde kaçışlanır ("%", "_", "\").
function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export async function searchProfiles(filters: {
  query?: string;
  title?: ProfileTitle;
  city?: string;
}): Promise<ProfileSearchResult[]> {
  const supabase = await createClient();

  let userIdsWithTitle: string[] | null = null;
  if (filters.title) {
    const { data, error } = await supabase
      .from("profile_titles")
      .select("user_id")
      .eq("title", filters.title);
    if (error) throw error;
    userIdsWithTitle = data.map((row) => row.user_id);
    if (userIdsWithTitle.length === 0) return [];
  }

  let request = supabase
    .from("profiles")
    // profiles → profile_titles arasında onaylar üzerinden ikinci bir ilişki de var; doğrudan FK seçilir.
    .select(
      "user_id, display_name, city, profile_titles!profile_titles_user_id_fkey(title, title_endorsements(count))",
    )
    .order("display_name", { ascending: true })
    .limit(MAX_SEARCH_RESULTS);

  if (filters.query) request = request.ilike("display_name", `%${escapeLikePattern(filters.query)}%`);
  if (filters.city) request = request.eq("city", filters.city);
  if (userIdsWithTitle) request = request.in("user_id", userIdsWithTitle);

  const { data, error } = await request;
  if (error) throw error;

  return data.map((profile) => ({
    userId: profile.user_id,
    displayName: profile.display_name,
    city: profile.city,
    titles: profile.profile_titles
      .filter((row) => isProfileTitle(row.title))
      .map((row) => ({
        title: row.title as ProfileTitle,
        endorsementCount: row.title_endorsements[0]?.count ?? 0,
      }))
      .sort((a, b) => compareProfileTitles(a.title, b.title)),
  }));
}
