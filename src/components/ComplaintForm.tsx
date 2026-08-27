"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitComplaint } from "@/app/(site)/complaints/actions";
import { initialComplaintState } from "@/lib/actionState";
import { COMPLAINT_CATEGORIES } from "@/lib/types";
import { CheckIcon } from "@/components/icons";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "보내는 중…" : "익명으로 보내기"}
    </button>
  );
}

export function ComplaintForm() {
  const [state, formAction] = useActionState(
    submitComplaint,
    initialComplaintState,
  );
  const [length, setLength] = useState(0);

  if (state.status === "success") {
    return (
      <div className="card px-5 py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <CheckIcon className="h-6 w-6" />
        </div>
        <p className="mt-3 text-lg font-extrabold text-slate-900">
          {state.message}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          누가 썼는지는 아무도 알 수 없어요.
          <br />
          반장이 확인한 뒤 반영할게요.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-ghost mt-5"
        >
          하나 더 쓰기
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="card space-y-4 px-4 py-5">
      <div>
        <label className="label" htmlFor="category">
          어떤 이야기인가요?
        </label>
        <select
          id="category"
          name="category"
          className="field"
          defaultValue="학급 생활"
        >
          {COMPLAINT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="content">
          내용
        </label>
        <textarea
          id="content"
          name="content"
          rows={7}
          maxLength={2000}
          required
          onChange={(e) => setLength(e.target.value.length)}
          placeholder="하고 싶은 말을 자유롭게 적어주세요. 이름을 쓰지 않아도 괜찮아요."
          className="field resize-none leading-relaxed"
        />
        <p className="mt-1 text-right text-xs text-slate-400">{length}/2000</p>
      </div>

      {/* 봇 방지용 함정 필드 (화면·스크린리더에서 숨김, 저장되지 않음) */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {state.status === "error" ? (
        <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-600">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
