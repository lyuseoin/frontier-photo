import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { getNotices, getTimetable, getUpcomingEvents } from "@/lib/data";
import { getUnhandledComplaintCount } from "@/lib/adminData";
import { isAdminSupabaseConfigured } from "@/lib/supabase";
import { dDayLabel, diffDays, todayKST } from "@/lib/date";
import { CATEGORY_META } from "@/lib/types";

export const dynamic = "force-dynamic";

const SHORTCUTS = [
  { href: "/admin/notices", label: "공지 등록·수정", emoji: "📢" },
  { href: "/admin/events", label: "일정 등록·수정", emoji: "🗓️" },
  { href: "/admin/timetable", label: "시간표 편집", emoji: "🧾" },
  { href: "/admin/complaints", label: "민원함 확인", emoji: "✉️" },
  { href: "/admin/settings", label: "학급 이름 설정", emoji: "⚙️" },
];

export default async function AdminHomePage() {
  const today = todayKST();
  const [notices, events, timetable, unhandled] = await Promise.all([
    getNotices(),
    getUpcomingEvents(3),
    getTimetable(),
    getUnhandledComplaintCount(),
  ]);

  return (
    <div className="space-y-6">
      {!isAdminSupabaseConfigured() ? (
        <p className="rounded-2xl border border-accent-400/40 bg-accent-50 px-4 py-3 text-sm font-semibold text-amber-700">
          SUPABASE_SERVICE_ROLE_KEY 환경변수가 없어 등록·수정 기능이 동작하지
          않습니다. README를 확인해 주세요.
        </p>
      ) : null}

      <section className="grid grid-cols-3 gap-2.5">
        <Stat label="공지" value={notices.length} suffix="건" />
        <Stat label="다가오는 일정" value={events.length} suffix="건" />
        <Stat
          label="미확인 민원"
          value={unhandled}
          suffix="건"
          highlight={unhandled > 0}
        />
      </section>

      {events.length > 0 ? (
        <section>
          <h2 className="mb-2 text-base font-bold text-slate-900">
            곧 다가오는 일정
          </h2>
          <ul className="card divide-y divide-slate-100">
            {events.map((event) => {
              const left = diffDays(today, event.start_date);
              return (
                <li
                  key={event.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${CATEGORY_META[event.category].dot}`}
                  />
                  <p className="min-w-0 flex-1 truncate font-semibold text-slate-800">
                    {event.title}
                  </p>
                  <span className="shrink-0 text-xs font-extrabold text-brand-600">
                    {left < 0 ? "진행중" : dDayLabel(left)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="mb-2 text-base font-bold text-slate-900">바로가기</h2>
        <ul className="card divide-y divide-slate-100">
          {SHORTCUTS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50"
              >
                <span aria-hidden>{item.emoji}</span>
                <span className="flex-1 font-semibold text-slate-800">
                  {item.label}
                </span>
                <ChevronRightIcon className="h-4 w-4 text-slate-300" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs leading-relaxed text-slate-400">
        등록된 시간표 칸 {timetable.length}개 · 관리자 세션은 12시간 뒤 자동으로
        만료됩니다.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  highlight = false,
}: {
  label: string;
  value: number;
  suffix: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-3 py-3.5 text-center ${
        highlight
          ? "border-accent-400/50 bg-accent-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-extrabold ${
          highlight ? "text-accent-600" : "text-slate-900"
        }`}
      >
        {value}
        <span className="ml-0.5 text-sm font-bold text-slate-400">
          {suffix}
        </span>
      </p>
    </div>
  );
}
