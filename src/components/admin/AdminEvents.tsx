"use client";

import { useActionState, useEffect, useState } from "react";
import { deleteEvent, saveEvent } from "@/app/admin/actions";
import { idleState } from "@/lib/actionState";
import {
  ConfirmButton,
  FormMessage,
  SubmitButton,
} from "@/components/admin/formBits";
import { formatRangeKo } from "@/lib/date";
import {
  CATEGORY_META,
  type ClassEvent,
  type EventCategory,
} from "@/lib/types";

const CATEGORIES: EventCategory[] = ["exam", "assignment", "activity"];

export function AdminEvents({
  events,
  today,
}: {
  events: ClassEvent[];
  today: string;
}) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const upcoming = events.filter((e) => (e.end_date ?? e.start_date) >= today);
  const past = events
    .filter((e) => (e.end_date ?? e.start_date) < today)
    .sort((a, b) => b.start_date.localeCompare(a.start_date));

  return (
    <div className="space-y-4">
      {creating ? (
        <EventForm
          key="new"
          today={today}
          onDone={() => setCreating(false)}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="btn-primary w-full"
        >
          + 새 일정 등록
        </button>
      )}

      <Group
        title={`예정된 일정 (${upcoming.length})`}
        events={upcoming}
        today={today}
        editingId={editingId}
        setEditingId={setEditingId}
      />

      {past.length > 0 ? (
        <Group
          title="지난 일정"
          events={past}
          today={today}
          editingId={editingId}
          setEditingId={setEditingId}
          muted
        />
      ) : null}
    </div>
  );
}

function Group({
  title,
  events,
  today,
  editingId,
  setEditingId,
  muted = false,
}: {
  title: string;
  events: ClassEvent[];
  today: string;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  muted?: boolean;
}) {
  return (
    <section>
      <h2
        className={`mb-2 text-sm font-bold ${muted ? "text-slate-400" : "text-slate-700"}`}
      >
        {title}
      </h2>
      {events.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
          일정이 없습니다.
        </p>
      ) : (
        <ul className={`space-y-2 ${muted ? "opacity-70" : ""}`}>
          {events.map((event) =>
            editingId === event.id ? (
              <li key={event.id}>
                <EventForm
                  event={event}
                  today={today}
                  onDone={() => setEditingId(null)}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li key={event.id} className="card flex overflow-hidden">
                <span
                  className={`w-1.5 shrink-0 ${CATEGORY_META[event.category].bar}`}
                />
                <div className="min-w-0 flex-1 px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ${CATEGORY_META[event.category].chip}`}
                    >
                      {CATEGORY_META[event.category].label}
                    </span>
                    <p className="truncate font-bold text-slate-900">
                      {event.title}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatRangeKo(event.start_date, event.end_date)}
                  </p>
                  {event.description ? (
                    <p className="mt-1.5 line-clamp-2 whitespace-pre-wrap text-sm text-slate-600">
                      {event.description}
                    </p>
                  ) : null}

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(event.id)}
                      className="btn-ghost px-3 py-2 text-xs"
                    >
                      수정
                    </button>
                    <form action={deleteEvent} className="ml-auto">
                      <input type="hidden" name="id" value={event.id} />
                      <ConfirmButton
                        message={`'${event.title}' 일정을 삭제할까요?`}
                        className="btn-danger px-3 py-2 text-xs"
                      >
                        삭제
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}

function EventForm({
  event,
  today,
  onDone,
  onCancel,
}: {
  event?: ClassEvent;
  today: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(saveEvent, idleState);
  const uid = event?.id ?? "new";

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="card space-y-3 px-4 py-4">
      {event ? <input type="hidden" name="id" value={event.id} /> : null}

      <div>
        <span className="label">종류</span>
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <label
              key={c}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-500 transition has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700"
            >
              <input
                type="radio"
                name="category"
                value={c}
                defaultChecked={(event?.category ?? "exam") === c}
                className="sr-only"
              />
              <span
                className={`h-2 w-2 rounded-full ${CATEGORY_META[c].dot}`}
              />
              {CATEGORY_META[c].label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor={`ev-title-${uid}`}>
          일정 이름
        </label>
        <input
          id={`ev-title-${uid}`}
          name="title"
          className="field"
          required
          maxLength={120}
          defaultValue={event?.title ?? ""}
          placeholder="예) 1학기 중간고사"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="label" htmlFor={`ev-start-${uid}`}>
            시작일
          </label>
          <input
            id={`ev-start-${uid}`}
            name="start_date"
            type="date"
            required
            className="field"
            defaultValue={event?.start_date ?? today}
          />
        </div>
        <div>
          <label className="label" htmlFor={`ev-end-${uid}`}>
            종료일 <span className="font-normal text-slate-400">(선택)</span>
          </label>
          <input
            id={`ev-end-${uid}`}
            name="end_date"
            type="date"
            className="field"
            defaultValue={event?.end_date ?? ""}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor={`ev-desc-${uid}`}>
          설명 <span className="font-normal text-slate-400">(선택)</span>
        </label>
        <textarea
          id={`ev-desc-${uid}`}
          name="description"
          rows={3}
          className="field resize-none leading-relaxed"
          defaultValue={event?.description ?? ""}
          placeholder="예) 1~4교시, 국어·영어·수학"
        />
      </div>

      <FormMessage state={state} />

      <div className="flex gap-2">
        <SubmitButton className="btn-primary flex-1">
          {event ? "수정 저장" : "일정 등록"}
        </SubmitButton>
        <button type="button" onClick={onCancel} className="btn-ghost">
          취소
        </button>
      </div>
    </form>
  );
}
