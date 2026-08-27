import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "class_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12시간

function sessionSecret(): string {
  // ?? 는 빈 문자열을 통과시키므로 || 를 쓴다 (값 없이 등록된 환경변수 대비)
  const secret =
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "";
  if (!secret) {
    throw new Error(
      "ADMIN_PASSWORD (또는 ADMIN_SESSION_SECRET) 환경변수가 설정되지 않았습니다.",
    );
  }
  return secret;
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

function sign(value: string): string {
  return crypto
    .createHmac("sha256", sessionSecret())
    .update(value)
    .digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** 입력한 비밀번호가 맞는지 (타이밍 공격에 안전하게 비교) */
export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return false;
  return safeEqual(input.trim(), expected);
}

/** 로그인 성공 시 서명된 세션 쿠키를 굽는다 */
export async function createSession(): Promise<void> {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  const token = `${payload}.${sign(payload)}`;
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** 현재 요청이 관리자 세션인지 */
export async function isAdmin(): Promise<boolean> {
  if (!isAdminPasswordConfigured()) return false;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;
  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

/** 서버 액션 안에서 관리자 권한 강제 */
export async function assertAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("관리자 권한이 필요합니다. 다시 로그인해 주세요.");
  }
}
