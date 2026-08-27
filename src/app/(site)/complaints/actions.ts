"use server";

import { supabasePublic } from "@/lib/supabase";
import type { ComplaintFormState } from "@/lib/actionState";
import { COMPLAINT_CATEGORIES } from "@/lib/types";

/**
 * 익명 민원 저장.
 * ⚠️ 작성자를 특정할 수 있는 값(IP, User-Agent, 쿠키, 세션 등)은
 *    읽지도 저장하지도 않습니다. 분류와 본문만 그대로 넣습니다.
 */
export async function submitComplaint(
  _prev: ComplaintFormState,
  formData: FormData,
): Promise<ComplaintFormState> {
  // 봇 방지용 함정 필드 — 사람이면 항상 비어 있음 (저장하지 않음)
  if (String(formData.get("website") ?? "").length > 0) {
    return { status: "success", message: "접수되었습니다." };
  }

  const content = String(formData.get("content") ?? "").trim();
  const rawCategory = String(formData.get("category") ?? "기타");
  const category = (COMPLAINT_CATEGORIES as readonly string[]).includes(
    rawCategory,
  )
    ? rawCategory
    : "기타";

  if (content.length < 5) {
    return { status: "error", message: "내용을 5자 이상 적어주세요." };
  }
  if (content.length > 2000) {
    return { status: "error", message: "내용은 2000자까지 쓸 수 있어요." };
  }
  const db = supabasePublic();
  if (!db) {
    return {
      status: "error",
      message: "아직 서버 설정이 끝나지 않았어요. 반장에게 알려주세요.",
    };
  }

  const { error } = await db.from("complaints").insert({ category, content });

  if (error) {
    return {
      status: "error",
      message: "전송에 실패했어요. 잠시 후 다시 시도해 주세요.",
    };
  }

  return { status: "success", message: "익명으로 잘 전달되었어요." };
}
