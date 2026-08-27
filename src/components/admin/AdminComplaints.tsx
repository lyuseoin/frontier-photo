"use client";

import { useActionState, useState } from "react";
import {
  deleteComplaint,
  saveComplaintMemo,
  setComplaintHandled,
} from "@/app/admin/actions";
import { idleState } from "@/lib/actionState";
import {
  ConfirmButton,
  FormMessage,
  SubmitButton,
} from "@/components/admin/formBits";
import { CheckIcon } from "@/components/icons";
import { formatTimestampFullKo } from "@/lib/date";
import type { Complaint } from "@/lib/types";

type Filter = "all" | "todo" | "done";

export function AdminComplaints({ complaints }: { complaints: Complaint[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = {
    all: complaints.length,
    todo: complaints.filter((c) => !c.is_handled).length,
    done: complaints.filter((c) => c.is_handled).length,
  };

  const visible = complaints.filter((c) =>
    filter === "all" ? true : filter === "todo" ? !c.is_handled : c.is_handled,
  );

  return (
    <div className="space-y-4">
      <div className="inline-flex w-full rounded-xl bg-slate-100 p-1">
        {(
          [
            ["all", "전체"],
            ["todo", "미확인"],
            ["done", "확인 완료"],
          ] as [Filter, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
              filter === value
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            {label} {counts[value]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
          표시할 민원이 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ComplaintCard({ complaint }: { complaint: Complaint }) {
  const [memoOpen, setMemoOpen] = useState(false);
  const [state, formAction] = useActionState(saveComplaintMemo, idleState);

  return (
    <li
      className={`card px-4 py-3.5 ${complaint.is_handled ? "opacity-70" : ""}`}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500">
          {complaint.category}
        </span>
        {complaint.is_handled ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-600">
            <CheckIcon className="h-3 w-3" />
            확인 완료
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-accent-50 px-1.5 py-0.5 text-[11px] font-bold text-accent-600">
            미확인
          </span>
        )}
        <span className="ml-auto shrink-0 text-[11px] text-slate-400">
          {formatTimestampFullKo(complaint.created_at)}
        </span>
      </div>

      <p className="mt-2.5 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">
        {complaint.content}
      </p>

      {complaint.admin_memo && !memoOpen ? (
        <p className="mt-2.5 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
          <span className="font-bold text-slate-600">메모 </span>
          {complaint.admin_memo}
        </p>
      ) : null}

      {memoOpen ? (
        <form action={formAction} className="mt-3 space-y-2">
          <input type="hidden" name="id" value={complaint.id} />
          <textarea
            name="admin_memo"
            rows={2}
            defaultValue={complaint.admin_memo}
            placeholder="처리 메모 (관리자만 볼 수 있어요)"
            className="field resize-none text-sm"
          />
          <FormMessage state={state} />
          <div className="flex gap-2">
            <SubmitButton className="btn-primary flex-1 py-2 text-xs">
              메모 저장
            </SubmitButton>
            <button
              type="button"
              onClick={() => setMemoOpen(false)}
              className="btn-ghost px-3 py-2 text-xs"
            >
              닫기
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <form action={setComplaintHandled}>
            <input type="hidden" name="id" value={complaint.id} />
            <input
              type="hidden"
              name="next"
              value={String(!complaint.is_handled)}
            />
            <SubmitButton
              className={
                complaint.is_handled
                  ? "btn-ghost px-3 py-2 text-xs"
                  : "btn bg-emerald-600 px-3 py-2 text-xs text-white hover:bg-emerald-700"
              }
              pendingLabel="…"
            >
              {complaint.is_handled ? "확인 취소" : "확인 완료"}
            </SubmitButton>
          </form>

          <button
            type="button"
            onClick={() => setMemoOpen(true)}
            className="btn-ghost px-3 py-2 text-xs"
          >
            {complaint.admin_memo ? "메모 수정" : "메모"}
          </button>

          <form action={deleteComplaint} className="ml-auto">
            <input type="hidden" name="id" value={complaint.id} />
            <ConfirmButton
              message="이 민원을 삭제할까요? 되돌릴 수 없어요."
              className="btn-danger px-3 py-2 text-xs"
            >
              삭제
            </ConfirmButton>
          </form>
        </div>
      )}
    </li>
  );
}
