"use client";

import { useActionState, useState } from "react";
import { saveDayTimetable } from "@/app/admin/actions";
import { idleState } from "@/lib/actionState";
import { FormMessage, SubmitButton } from "@/components/admin/formBits";
import { DAY_LABELS, type TimetableSlot } from "@/lib/types";

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export function AdminTimetable({
  slots,
  todayColumn,
}: {
  slots: TimetableSlot[];
  todayColumn: number | null;
}) {
  const [day, setDay] = useState<number>(todayColumn ?? 1);

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {DAY_LABELS.map((label, i) => {
          const value = i + 1;
          const active = value === day;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setDay(value)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                active
                  ? "bg-brand-600 text-white"
                  : "bg-white text-slate-500 ring-1 ring-slate-200"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <DayForm
        key={day}
        day={day}
        slots={slots.filter((s) => s.day_of_week === day)}
      />

      <p className="text-xs leading-relaxed text-slate-400">
        과목명을 비우고 저장하면 그 교시는 시간표에서 삭제됩니다. 요일마다 따로
        저장해 주세요.
      </p>
    </div>
  );
}

function DayForm({ day, slots }: { day: number; slots: TimetableSlot[] }) {
  const [state, formAction] = useActionState(saveDayTimetable, idleState);
  const byPeriod = new Map(slots.map((s) => [s.period, s]));

  return (
    <form action={formAction} className="card space-y-3 px-4 py-4">
      <input type="hidden" name="day_of_week" value={day} />

      <h2 className="text-base font-bold text-slate-900">
        {DAY_LABELS[day - 1]}요일 시간표
      </h2>

      <ul className="space-y-2">
        {PERIODS.map((period) => {
          const slot = byPeriod.get(period);
          return (
            <li key={period} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-center text-xs font-bold text-slate-400">
                {period}
              </span>
              <input
                name={`subject-${period}`}
                defaultValue={slot?.subject ?? ""}
                placeholder="과목"
                maxLength={20}
                aria-label={`${period}교시 과목`}
                className="field flex-[2] px-3 py-2 text-sm"
              />
              <input
                name={`room-${period}`}
                defaultValue={slot?.room ?? ""}
                placeholder="장소"
                maxLength={20}
                aria-label={`${period}교시 장소`}
                className="field flex-1 px-3 py-2 text-sm"
              />
              <input
                name={`teacher-${period}`}
                defaultValue={slot?.teacher ?? ""}
                placeholder="선생님"
                maxLength={20}
                aria-label={`${period}교시 선생님`}
                className="field flex-1 px-3 py-2 text-sm"
              />
            </li>
          );
        })}
      </ul>

      <FormMessage state={state} />

      <SubmitButton className="btn-primary w-full">
        {DAY_LABELS[day - 1]}요일 저장
      </SubmitButton>
    </form>
  );
}
