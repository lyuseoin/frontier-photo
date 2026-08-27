"use client";

import { useMemo, useState } from "react";
import {
  buildMonthGrid,
  coversDate,
  diffDays,
  dDayLabel,
  formatDateKo,
  formatRangeKo,
  parseDateKey,
} from "@/lib/date";
import {
  CATEGORY_META,
  type ClassEvent,
  type EventCategory,
} from "@/lib/types";

const CATEGORIES: EventCategory[] = ["exam", "assignment", "activity"];
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

type View = "calendar" | "list";

export function ScheduleView({
  events,
  today,
}: {
  events: ClassEvent[];
  today: string;
}) {
  const todayDate = parseDateKey(today);
  const [view, setView] = useState<View>("calendar");
  const [cursor, setCursor] = useState({
    year: todayDate.getUTCFullYear(),
    month: todayDate.getUTCMonth() + 1,
  });
  const [selected, setSelected] = useState<string | null>(today);
  const [active, setActive] = useState<EventCategory[]>(CATEGORIES);

  const visible = useMemo(
    () => events.filter((e) => active.includes(e.category)),
    [events, active],
  );

  const grid = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month),
    [cursor],
  );

  const eventsOn = (key: string) =>
    visible.filter((e) => coversDate(e.start_date, e.end_date, key));

  function toggleCategory(category: EventCategory) {
    setActive((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  }

  function moveMonth(delta: number) {
    setCursor((prev) => {
      const next = new Date(Date.UTC(prev.year, prev.month - 1 + delta, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1 };
    });
    setSelected(null);
  }

  function goToday() {
    setCursor({
      year: todayDate.getUTCFullYear(),
      month: todayDate.getUTCMonth() + 1,
    });
    setSelected(today);
  }

  const selectedEvents = selected ? eventsOn(selected) : [];

  return (
    <div className="space-y-4">
      {/* 보기 전환 + 카테고리 필터 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          {(["calendar", "list"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-bold transition ${
                view === v
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              {v === "calendar" ? "달력" : "목록"}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {CATEGORIES.map((c) => {
            const on = active.includes(c);
            const meta = CATEGORY_META[c];
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCategory(c)}
                aria-pressed={on}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold transition ${
                  on
                    ? meta.chip
                    : "bg-white text-slate-300 ring-1 ring-slate-200"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${on ? meta.dot : "bg-slate-200"}`}
                />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {view === "calendar" ? (
        <>
          <div className="card overflow-hidden">
            {/* 월 이동 */}
            <div className="flex items-center justify-between px-3 py-3">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                aria-label="이전 달"
                className="rounded-lg px-3 py-1.5 text-lg font-bold text-slate-400 hover:bg-slate-50"
              >
                ‹
              </button>
              <div className="flex items-center gap-2">
                <p className="text-base font-extrabold text-slate-900">
                  {cursor.year}년 {cursor.month}월
                </p>
                <button
                  type="button"
                  onClick={goToday}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:bg-slate-200"
                >
                  오늘
                </button>
              </div>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                aria-label="다음 달"
                className="rounded-lg px-3 py-1.5 text-lg font-bold text-slate-400 hover:bg-slate-50"
              >
                ›
              </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 border-y border-slate-100 bg-slate-50/60 py-1.5">
              {WEEKDAYS.map((w, i) => (
                <div
                  key={w}
                  className={`text-center text-[11px] font-bold ${
                    i === 0
                      ? "text-rose-400"
                      : i === 6
                        ? "text-brand-400"
                        : "text-slate-400"
                  }`}
                >
                  {w}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7">
              {grid.map((key) => {
                const date = parseDateKey(key);
                const inMonth = date.getUTCMonth() + 1 === cursor.month;
                const isToday = key === today;
                const isSelected = key === selected;
                const dayEvents = eventsOn(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelected(key)}
                    className={`flex h-[58px] flex-col items-center gap-1 border-b border-r border-slate-100 pt-1.5 transition last:border-r-0 ${
                      isSelected ? "bg-brand-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isToday
                          ? "bg-brand-600 text-white"
                          : inMonth
                            ? date.getUTCDay() === 0
                              ? "text-rose-500"
                              : "text-slate-700"
                            : "text-slate-300"
                      }`}
                    >
                      {date.getUTCDate()}
                    </span>
                    <span className="flex gap-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className={`h-1.5 w-1.5 rounded-full ${CATEGORY_META[e.category].dot}`}
                        />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 선택한 날짜의 일정 */}
          {selected ? (
            <section>
              <h2 className="mb-2 text-sm font-bold text-slate-700">
                {formatDateKo(selected)} 일정
              </h2>
              {selectedEvents.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
                  이 날은 등록된 일정이 없어요.
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedEvents.map((e) => (
                    <EventCard key={e.id} event={e} today={today} />
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </>
      ) : (
        <ListView events={visible} today={today} />
      )}
    </div>
  );
}

function ListView({ events, today }: { events: ClassEvent[]; today: string }) {
  const upcoming = events
    .filter((e) => (e.end_date ?? e.start_date) >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
  const past = events
    .filter((e) => (e.end_date ?? e.start_date) < today)
    .sort((a, b) => b.start_date.localeCompare(a.start_date));

  if (events.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
        등록된 일정이 없어요.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <section>
        <h2 className="mb-2 text-sm font-bold text-slate-700">
          예정된 일정 ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
            예정된 일정이 없어요.
          </p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} today={today} />
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-bold text-slate-400">지난 일정</h2>
          <ul className="space-y-2 opacity-60">
            {past.map((e) => (
              <EventCard key={e.id} event={e} today={today} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function EventCard({ event, today }: { event: ClassEvent; today: string }) {
  const meta = CATEGORY_META[event.category];
  const left = diffDays(today, event.start_date);
  const ended = (event.end_date ?? event.start_date) < today;

  return (
    <li className="card flex overflow-hidden">
      <span className={`w-1.5 shrink-0 ${meta.bar}`} />
      <div className="min-w-0 flex-1 px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ${meta.chip}`}
          >
            {meta.label}
          </span>
          <p className="truncate font-bold text-slate-900">{event.title}</p>
          {!ended ? (
            <span className="ml-auto shrink-0 text-xs font-extrabold text-brand-600">
              {left < 0 ? "진행중" : dDayLabel(left)}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {formatRangeKo(event.start_date, event.end_date)}
        </p>
        {event.description ? (
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
            {event.description}
          </p>
        ) : null}
      </div>
    </li>
  );
}
