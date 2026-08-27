"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { login } from "@/app/admin/actions";
import { idleState } from "@/lib/actionState";
import { LockIcon } from "@/components/icons";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "확인 중…" : "로그인"}
    </button>
  );
}

export function LoginScreen({ configured }: { configured: boolean }) {
  const [state, formAction] = useActionState(login, idleState);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <LockIcon className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900">
            관리자 로그인
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            반장만 사용하는 페이지예요.
          </p>
        </div>

        {!configured ? (
          <p className="mb-3 rounded-xl bg-accent-50 px-3.5 py-2.5 text-sm font-semibold text-amber-700">
            ADMIN_PASSWORD 환경변수가 설정되지 않았습니다. README를 확인해
            주세요.
          </p>
        ) : null}

        <form action={formAction} className="card space-y-3 px-4 py-5">
          <div>
            <label className="label" htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="field"
              placeholder="••••••••"
            />
          </div>

          {state.message ? (
            <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-600">
              {state.message}
            </p>
          ) : null}

          <SubmitButton />
        </form>

        <Link
          href="/"
          className="mt-4 block text-center text-sm font-semibold text-slate-400 hover:text-brand-600"
        >
          ← 홈페이지로 돌아가기
        </Link>
      </div>
    </div>
  );
}
