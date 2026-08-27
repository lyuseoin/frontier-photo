import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 환경변수에 들어온 Supabase 주소를 최대한 살려서 정규화한다.
 * 붙여넣다 흔히 생기는 실수(따옴표, 앞뒤 공백, https:// 누락, 프로젝트 ID만 복사)를
 * 여기서 바로잡는다. 그래도 주소가 아니면 null 을 돌려주고, 앱은 '설정 안 됨'으로 동작한다.
 */
export function normalizeSupabaseUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  let value = raw
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "");
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) {
    value = value.includes(".")
      ? `https://${value}` // abcdefgh.supabase.co
      : `https://${value}.supabase.co`; // 프로젝트 ID만 복사한 경우
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

function cleanKey(raw: string | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim().replace(/^["']|["']$/g, "");
  return value || null;
}

const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anonKey = cleanKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const serviceKey = cleanKey(process.env.SUPABASE_SERVICE_ROLE_KEY);

/** 설정 상태 — 진단 화면(/setup-check)과 안내 배너에서 사용 */
export function supabaseStatus() {
  return {
    urlProvided: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    urlValid: Boolean(url),
    urlHost: url ? new URL(url).host : null,
    anonKeyProvided: Boolean(anonKey),
    serviceKeyProvided: Boolean(serviceKey),
  };
}

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

/**
 * RLS가 적용되는 익명 클라이언트 — 공개 콘텐츠 읽기, 민원 작성.
 * 설정이 없거나 주소가 잘못됐으면 예외 대신 null 을 돌려준다.
 * (예외를 던지면 페이지 전체가 'Application error' 로 죽어버린다)
 */
export function supabasePublic(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!publicClient) {
    try {
      publicClient = createClient(url, anonKey, options);
    } catch (error) {
      console.error("[supabase] 익명 클라이언트를 만들지 못했습니다:", error);
      return null;
    }
  }
  return publicClient;
}

/**
 * RLS를 우회하는 관리자 클라이언트.
 * 반드시 서버(서버 컴포넌트 / 서버 액션)에서 관리자 인증을 확인한 뒤에만 사용합니다.
 */
export function supabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  if (!adminClient) {
    try {
      adminClient = createClient(url, serviceKey, options);
    } catch (error) {
      console.error("[supabase] 관리자 클라이언트를 만들지 못했습니다:", error);
      return null;
    }
  }
  return adminClient;
}
