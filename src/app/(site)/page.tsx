import Link from "next/link";
import {
  CategoryChip,
  EmptyState,
  SectionHeading,
  SetupNotice,
} from "@/components/ui";
import { ChevronRightIcon, PinIcon } from "@/components/icons";
import { getNotices, getSettings, getUpcomingEvents } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  dDayLabel,
  diffDays,
  formatDateKo,
  formatRangeKo,
  formatTimestampKo,
  todayKST,
} from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = todayKST();
  const [settings, events, notices] = await Promise.all([
    getSettings(),
    getUpcomingEvents(4),
    getNotices(3),
  ]);

  return (
    <div className="space-y-7">
      {!isSupabaseConfigured() ? <SetupNotice /> : null}

      {/* 인사 영역 */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 px-5 py-6 text-white shadow-sm">
        <p className="text-xs font-semibold text-brand-100">
          {formatDateKo(today, true)}
        </p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight">
          {settings.class_name} 오늘도 반가워요 👋
        </h1>
        {settings.tagline ? (
          <p className="mt-1.5 text-sm text-brand-100">{settings.tagline}</p>
        ) : null}
      </section>

      {/* 다가오는 일정 D-day */}
      <section>
        <SectionHeading title="다가오는 일정" href="/schedule" />
        {events.length === 0 ? (
          <EmptyState>등록된 다가오는 일정이 없어요.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {events.map((event) => {
              const left = diffDays(today, event.start_date);
              const ongoing = left < 0;
              return (
                <li
                  key={event.id}
                  className="card flex items-center gap-3.5 px-4 py-3.5"
                >
                  <div
                    className={`flex h-12 w-[62px] shrink-0 flex-col items-center justify-center rounded-xl text-sm font-extrabold ${
                      left <= 0
                        ? "bg-brand-600 text-white"
                        : left <= 7
                          ? "bg-brand-50 text-brand-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {ongoing ? "진행중" : dDayLabel(left)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <CategoryChip category={event.category} />
                      <p className="truncate font-bold text-slate-900">
                        {event.title}
                      </p>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {formatRangeKo(event.start_date, event.end_date)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 최신 공지 */}
      <section>
        <SectionHeading title="최신 공지" href="/notices" />
        {notices.length === 0 ? (
          <EmptyState>아직 등록된 공지가 없어요.</EmptyState>
        ) : (
          <ul className="card divide-y divide-slate-100">
            {notices.map((notice) => (
              <li key={notice.id}>
                <Link
                  href={`/notices/${notice.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {notice.is_pinned ? (
                        <PinIcon className="h-3.5 w-3.5 shrink-0 text-accent-500" />
                      ) : null}
                      <p className="truncate font-bold text-slate-900">
                        {notice.title}
                      </p>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {formatTimestampKo(notice.created_at)}
                      {notice.content
                        ? ` · ${notice.content.replace(/\s+/g, " ")}`
                        : ""}
                    </p>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 민원함 안내 */}
      <section>
        <Link
          href="/complaints"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:bg-slate-50"
        >
          <div className="flex-1">
            <p className="font-bold text-slate-900">익명 민원함 ✉️</p>
            <p className="mt-0.5 text-xs text-slate-500">
              하고 싶은 말을 이름 없이 남겨보세요. 반장만 볼 수 있어요.
            </p>
          </div>
          <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />
        </Link>
      </section>
    </div>
  );
}
