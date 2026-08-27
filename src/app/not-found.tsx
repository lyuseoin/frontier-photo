import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-4xl">🔎</p>
      <h1 className="text-xl font-extrabold text-slate-900">
        페이지를 찾을 수 없어요
      </h1>
      <p className="text-sm text-slate-500">
        주소가 바뀌었거나 삭제된 글일 수 있어요.
      </p>
      <Link href="/" className="btn-primary mt-2">
        홈으로 가기
      </Link>
    </div>
  );
}
