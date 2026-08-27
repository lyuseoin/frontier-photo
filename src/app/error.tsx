"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-5 text-center">
      <p className="text-4xl">🛠️</p>
      <h1 className="text-xl font-extrabold text-slate-900">
        화면을 불러오지 못했어요
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-slate-500">
        잠시 뒤 다시 시도해 보세요. 계속 이러면 반장님이{" "}
        <Link
          href="/setup-check"
          className="font-semibold text-brand-600 underline"
        >
          설정 점검 페이지
        </Link>
        에서 무엇이 빠졌는지 확인할 수 있어요.
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-slate-400">
          오류 번호 {error.digest}
        </p>
      ) : null}
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={reset} className="btn-primary">
          다시 시도
        </button>
        <Link href="/" className="btn-ghost">
          홈으로
        </Link>
      </div>
    </div>
  );
}
