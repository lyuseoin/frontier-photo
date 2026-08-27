import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** 공개 읽기 / 민원 작성용 환경변수가 준비됐는지 */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

/** 관리자 쓰기(service_role)용 환경변수가 준비됐는지 */
export function isAdminSupabaseConfigured(): boolean {
  return Boolean(url && serviceKey);
}

const options = { auth: { persistSession: false, autoRefreshToken: false } };

let publicClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

/** RLS가 적용되는 익명 클라이언트 — 공개 콘텐츠 읽기, 민원 작성 */
export function supabasePublic(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.",
    );
  }
  publicClient ??= createClient(url, anonKey, options);
  return publicClient;
}

/**
 * RLS를 우회하는 관리자 클라이언트.
 * 반드시 서버(서버 컴포넌트 / 서버 액션)에서 관리자 인증을 확인한 뒤에만 사용합니다.
 */
export function supabaseAdmin(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.",
    );
  }
  adminClient ??= createClient(url, serviceKey, options);
  return adminClient;
}
