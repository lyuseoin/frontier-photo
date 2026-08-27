import { EmptyState, PageTitle, SetupNotice } from "@/components/ui";
import { AdminEditBar } from "@/components/AdminEditBar";
import { AdminTimetable } from "@/components/admin/AdminTimetable";
import { isAdmin } from "@/lib/auth";
import { getTimetable } from "@/lib/data";
import { todayWeekdayKST } from "@/lib/date";
import { isSupabaseConfigured } from "@/lib/supabase";
import { DAY_LABELS, type TimetableSlot } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "시간표" };

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const [{ edit }, slots, admin] = await Promise.all([
    searchParams,
    getTimetable(),
    isAdmin(),
  ]);
  const editing = admin && edit === "1";
  const weekday = todayWeekdayKST(); // 0=일 ~ 6=토
  const todayColumn = weekday >= 1 && weekday <= 5 ? weekday : null;

  return (
    <>
      {!isSupabaseConfigured() ? <SetupNotice /> : null}
      <PageTitle
        title="시간표"
        description={
          todayColumn
            ? `오늘은 ${DAY_LABELS[todayColumn - 1]}요일이에요.`
            : "주말이에요. 다음 주 시간표를 확인하세요."
        }
      />

      {admin ? (
        <AdminEditBar editing={editing} basePath="/timetable" what="시간표" />
      ) : null}

      {editing ? (
        <AdminTimetable slots={slots} todayColumn={todayColumn} />
      ) : (
        <ReadView slots={slots} todayColumn={todayColumn} />
      )}
    </>
  );
}

function ReadView({
  slots,
  todayColumn,
}: {
  slots: TimetableSlot[];
  todayColumn: number | null;
}) {
  if (slots.length === 0) {
    return <EmptyState>아직 등록된 시간표가 없어요.</EmptyState>;
  }

  const maxPeriod = slots.reduce((max, s) => Math.max(max, s.period), 0);
  const periods = Array.from(
    { length: Math.max(maxPeriod, 6) },
    (_, i) => i + 1,
  );
  const byKey = new Map<string, TimetableSlot>();
  for (const slot of slots)
    byKey.set(`${slot.day_of_week}-${slot.period}`, slot);

  return (
    <div className="card overflow-hidden">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            <th className="w-8 border-b border-slate-100 bg-slate-50 py-2 text-[11px] font-bold text-slate-400">
              교시
            </th>
            {DAY_LABELS.map((label, i) => {
              const isToday = todayColumn === i + 1;
              return (
                <th
                  key={label}
                  className={`border-b border-l border-slate-100 py-2 text-xs font-bold ${
                    isToday
                      ? "bg-brand-600 text-white"
                      : "bg-slate-50 text-slate-500"
                  }`}
                >
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period}>
              <th className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-400">
                {period}
              </th>
              {DAY_LABELS.map((label, i) => {
                const day = i + 1;
                const isToday = todayColumn === day;
                const slot = byKey.get(`${day}-${period}`);
                return (
                  <td
                    key={label}
                    className={`h-14 border-b border-l border-slate-100 px-1 text-center align-middle ${
                      isToday ? "bg-brand-50/70" : ""
                    }`}
                  >
                    {slot ? (
                      <>
                        <p
                          className={`truncate text-[13px] font-bold ${
                            isToday ? "text-brand-700" : "text-slate-800"
                          }`}
                        >
                          {slot.subject}
                        </p>
                        {slot.room || slot.teacher ? (
                          <p className="truncate text-[10px] text-slate-400">
                            {[slot.room, slot.teacher]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-slate-200">·</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
