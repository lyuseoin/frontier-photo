"use client";

import { useActionState } from "react";
import { saveSettings } from "@/app/admin/actions";
import { idleState } from "@/lib/actionState";
import { FormMessage, SubmitButton } from "@/components/admin/formBits";
import type { ClassSettings } from "@/lib/types";

export function AdminSettings({ settings }: { settings: ClassSettings }) {
  const [state, formAction] = useActionState(saveSettings, idleState);

  return (
    <form action={formAction} className="card space-y-3 px-4 py-4">
      <div>
        <label className="label" htmlFor="class_name">
          학급 이름
        </label>
        <input
          id="class_name"
          name="class_name"
          className="field"
          required
          maxLength={40}
          defaultValue={settings.class_name}
          placeholder="예) 2학년 3반"
        />
        <p className="mt-1 text-xs text-slate-400">
          건의함 상단과 브라우저 탭 제목에 표시돼요.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="school_name">
          학교 이름 <span className="font-normal text-slate-400">(선택)</span>
        </label>
        <input
          id="school_name"
          name="school_name"
          className="field"
          maxLength={40}
          defaultValue={settings.school_name}
          placeholder="예) 프론티어고등학교"
        />
      </div>

      <div>
        <label className="label" htmlFor="tagline">
          한 줄 소개 <span className="font-normal text-slate-400">(선택)</span>
        </label>
        <input
          id="tagline"
          name="tagline"
          className="field"
          maxLength={80}
          defaultValue={settings.tagline}
          placeholder="예) 공지 · 일정 · 시간표를 한 곳에서"
        />
      </div>

      <FormMessage state={state} />

      <SubmitButton className="btn-primary w-full">설정 저장</SubmitButton>
    </form>
  );
}
