import { isSupabaseConfigured, supabasePublic } from "@/lib/supabase";
import { todayKST } from "@/lib/date";
import type {
  ClassEvent,
  ClassSettings,
  Notice,
  TimetableSlot,
} from "@/lib/types";

export const DEFAULT_SETTINGS: ClassSettings = {
  id: 1,
  class_name: "우리 반",
  school_name: "",
  tagline: "공지 · 일정 · 시간표를 한 곳에서",
  updated_at: new Date(0).toISOString(),
};

/** 학급 설정 (없거나 실패하면 기본값) */
export async function getSettings(): Promise<ClassSettings> {
  if (!isSupabaseConfigured()) return DEFAULT_SETTINGS;
  const { data, error } = await supabasePublic()
    .from("class_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  return data as ClassSettings;
}

/** 공지 목록 — 고정 공지가 항상 위 */
export async function getNotices(limit?: number): Promise<Notice[]> {
  if (!isSupabaseConfigured()) return [];
  let query = supabasePublic()
    .from("notices")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error || !data) return [];
  return data as Notice[];
}

export async function getNotice(id: string): Promise<Notice | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabasePublic()
    .from("notices")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as Notice;
}

/** 전체 일정 (달력·목록 공용) */
export async function getEvents(): Promise<ClassEvent[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabasePublic()
    .from("events")
    .select("*")
    .order("start_date", { ascending: true });
  if (error || !data) return [];
  return data as ClassEvent[];
}

/** 오늘 포함, 아직 끝나지 않은 일정만 가까운 순으로 */
export async function getUpcomingEvents(limit = 4): Promise<ClassEvent[]> {
  const today = todayKST();
  const events = await getEvents();
  return events
    .filter((e) => (e.end_date ?? e.start_date) >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .slice(0, limit);
}

/** 시간표 전체 */
export async function getTimetable(): Promise<TimetableSlot[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabasePublic()
    .from("timetable")
    .select("*")
    .order("day_of_week", { ascending: true })
    .order("period", { ascending: true });
  if (error || !data) return [];
  return data as TimetableSlot[];
}
