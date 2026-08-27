import "server-only";
import { assertAdmin } from "@/lib/auth";
import { isAdminSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import type { Complaint } from "@/lib/types";

/** 민원 목록 — 관리자 인증 + service_role 키로만 조회됩니다. */
export async function getComplaints(): Promise<Complaint[]> {
  await assertAdmin();
  if (!isAdminSupabaseConfigured()) return [];
  const { data, error } = await supabaseAdmin()
    .from("complaints")
    .select("*")
    .order("is_handled", { ascending: true })
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Complaint[];
}

/** 미확인 민원 개수 */
export async function getUnhandledComplaintCount(): Promise<number> {
  await assertAdmin();
  if (!isAdminSupabaseConfigured()) return 0;
  const { count, error } = await supabaseAdmin()
    .from("complaints")
    .select("id", { count: "exact", head: true })
    .eq("is_handled", false);
  if (error) return 0;
  return count ?? 0;
}
