import { supabasePublic } from "@/lib/supabase";
import type { ClassSettings } from "@/lib/types";

export const DEFAULT_SETTINGS: ClassSettings = {
  id: 1,
  class_name: "우리 반",
  school_name: "",
  tagline: "",
  updated_at: new Date(0).toISOString(),
};

/** 학급 설정 (없거나 실패하면 기본값) */
export async function getSettings(): Promise<ClassSettings> {
  const db = supabasePublic();
  if (!db) return DEFAULT_SETTINGS;
  const { data, error } = await db
    .from("class_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  return data as ClassSettings;
}
