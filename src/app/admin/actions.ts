"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  isAdmin,
  isAdminPasswordConfigured,
  verifyPassword,
} from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { ActionState } from "@/lib/actionState";
import type { EventCategory } from "@/lib/types";

function refresh() {
  revalidatePath("/", "layout");
}

function fail(message: string): ActionState {
  return { ok: false, message };
}

const SESSION_EXPIRED =
  "로그인이 풀렸어요. /admin 에서 다시 로그인해 주세요.";

const NOT_CONFIGURED =
  "서버 설정이 끝나지 않았습니다. Vercel 환경변수(Supabase 주소·키)를 확인해 주세요.";

/** service_role 클라이언트를 꺼낸다. 설정이 없으면 null */
function db() {
  return supabaseAdmin();
}

function done(message: string): ActionState {
  refresh();
  return { ok: true, message };
}

// ---------------------------------------------------------------- 로그인
export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isAdminPasswordConfigured()) {
    return fail("ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.");
  }
  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    return fail("비밀번호가 올바르지 않습니다.");
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

// ---------------------------------------------------------------- 공지
export async function saveNotice(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const isPinned = formData.get("is_pinned") === "on";

  if (!title) return fail("제목을 입력해 주세요.");

  const payload = { title, content, is_pinned: isPinned };
  const client = db();
  if (!client) return fail(NOT_CONFIGURED);
  const { error } = id
    ? await client.from("notices").update(payload).eq("id", id)
    : await client.from("notices").insert(payload);

  if (error) return fail(`저장 실패: ${error.message}`);
  return done(id ? "공지를 수정했습니다." : "공지를 등록했습니다.");
}

export async function deleteNotice(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  if (id) await db()?.from("notices").delete().eq("id", id);
  refresh();
}

export async function toggleNoticePin(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  const next = formData.get("next") === "true";
  if (id) {
    await db()?.from("notices").update({ is_pinned: next }).eq("id", id);
  }
  refresh();
}

// ---------------------------------------------------------------- 일정
const CATEGORIES: EventCategory[] = ["exam", "assignment", "activity"];

export async function saveEvent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const rawCategory = String(formData.get("category") ?? "activity");
  const category = (CATEGORIES as string[]).includes(rawCategory)
    ? (rawCategory as EventCategory)
    : "activity";
  const startDate = String(formData.get("start_date") ?? "");
  const rawEnd = String(formData.get("end_date") ?? "");
  const endDate = rawEnd && rawEnd !== startDate ? rawEnd : null;
  const description = String(formData.get("description") ?? "").trim();

  if (!title) return fail("일정 이름을 입력해 주세요.");
  if (!startDate) return fail("날짜를 선택해 주세요.");
  if (endDate && endDate < startDate) {
    return fail("종료일은 시작일보다 빠를 수 없습니다.");
  }

  const payload = {
    title,
    category,
    start_date: startDate,
    end_date: endDate,
    description,
  };
  const client = db();
  if (!client) return fail(NOT_CONFIGURED);
  const { error } = id
    ? await client.from("events").update(payload).eq("id", id)
    : await client.from("events").insert(payload);

  if (error) return fail(`저장 실패: ${error.message}`);
  return done(id ? "일정을 수정했습니다." : "일정을 등록했습니다.");
}

export async function deleteEvent(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  if (id) await db()?.from("events").delete().eq("id", id);
  refresh();
}

// ---------------------------------------------------------------- 시간표
export async function saveDayTimetable(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  const day = Number(formData.get("day_of_week"));
  if (!Number.isInteger(day) || day < 1 || day > 5) {
    return fail("요일 정보가 올바르지 않습니다.");
  }

  const client = db();
  if (!client) return fail(NOT_CONFIGURED);
  const upserts: {
    day_of_week: number;
    period: number;
    subject: string;
    teacher: string;
    room: string;
  }[] = [];
  const emptyPeriods: number[] = [];

  for (let period = 1; period <= 8; period += 1) {
    const subject = String(formData.get(`subject-${period}`) ?? "").trim();
    const teacher = String(formData.get(`teacher-${period}`) ?? "").trim();
    const room = String(formData.get(`room-${period}`) ?? "").trim();
    if (subject) {
      upserts.push({ day_of_week: day, period, subject, teacher, room });
    } else {
      emptyPeriods.push(period);
    }
  }

  if (upserts.length > 0) {
    const { error } = await client
      .from("timetable")
      .upsert(upserts, { onConflict: "day_of_week,period" });
    if (error) return fail(`저장 실패: ${error.message}`);
  }
  if (emptyPeriods.length > 0) {
    const { error } = await client
      .from("timetable")
      .delete()
      .eq("day_of_week", day)
      .in("period", emptyPeriods);
    if (error) return fail(`저장 실패: ${error.message}`);
  }

  return done("시간표를 저장했습니다.");
}

// ---------------------------------------------------------------- 민원함
export async function setComplaintHandled(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  const next = formData.get("next") === "true";
  if (id) {
    await db()
      ?.from("complaints")
      .update({
        is_handled: next,
        handled_at: next ? new Date().toISOString() : null,
      })
      .eq("id", id);
  }
  refresh();
}

export async function saveComplaintMemo(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  const id = String(formData.get("id") ?? "");
  const memo = String(formData.get("admin_memo") ?? "").trim();
  if (!id) return fail("대상을 찾을 수 없습니다.");
  const client = db();
  if (!client) return fail(NOT_CONFIGURED);
  const { error } = await client
    .from("complaints")
    .update({ admin_memo: memo })
    .eq("id", id);
  if (error) return fail(`저장 실패: ${error.message}`);
  return done("메모를 저장했습니다.");
}

export async function deleteComplaint(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  if (id) await db()?.from("complaints").delete().eq("id", id);
  refresh();
}

// ---------------------------------------------------------------- 설정
export async function saveSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  const className = String(formData.get("class_name") ?? "").trim();
  const schoolName = String(formData.get("school_name") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();

  if (!className) return fail("학급 이름을 입력해 주세요.");

  const client = db();
  if (!client) return fail(NOT_CONFIGURED);
  const { error } = await client.from("class_settings").upsert({
    id: 1,
    class_name: className,
    school_name: schoolName,
    tagline,
  });

  if (error) return fail(`저장 실패: ${error.message}`);
  return done("설정을 저장했습니다.");
}
