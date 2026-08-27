import Link from "next/link";

export function PageTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
        {title}
      </h1>
      {description ? (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export function SetupNotice() {
  return (
    <div className="mb-4 rounded-2xl border border-accent-400/40 bg-accent-50 px-4 py-3 text-sm text-amber-800">
      <p className="font-bold">Supabase 연결이 아직 설정되지 않았어요.</p>
      <p className="mt-1 leading-relaxed text-amber-700">
        <code>.env.local</code>(또는 Vercel 환경변수)에 Supabase 주소와 키를
        넣어주세요.{" "}
        <Link href="/setup-check" className="font-bold underline">
          무엇이 빠졌는지 확인하기 →
        </Link>
      </p>
    </div>
  );
}
