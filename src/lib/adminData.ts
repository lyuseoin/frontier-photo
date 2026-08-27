import "server-only";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { Complaint } from "@/lib/types";

/**
 * 민원 목록 — 관리자 인증 + service_role 키로만 조회됩니다.
 * 관리자가 아니면 예외를 던지지 않고 빈 결과를 돌려줍니다.
 * (레이아웃이 로그인 화면을 그리는 동안 페이지도 함께 렌더되기 때문에,
 *  여기서 던지면 로그인 화면 대신 에러 화면이 떠버립니다.)
 */
export async function getComplaints(): Promise<Complaint[]> {
  if (!(await isAdmin())) return [];
  const db = supabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("complaints")
    .select("*")
    .order("is_handled", { ascending: true })
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Complaint[];
}

/** 미확인 민원 개수 */
export async function getUnhandledComplaintCount(): Promise<number> {
  if (!(await isAdmin())) return 0;
  const db = supabaseAdmin();
  if (!db) return 0;
  const { count, error } = await db
    .from("complaints")
    .select("id", { count: "exact", head: true })
    .eq("is_handled", false);
  if (error) return 0;
  return count ?? 0;
}
