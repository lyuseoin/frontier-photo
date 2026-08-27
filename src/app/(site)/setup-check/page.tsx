import Link from "next/link";
import { PageTitle } from "@/components/ui";
import { isAdminPasswordConfigured } from "@/lib/auth";
import { supabasePublic, supabaseStatus } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "설정 점검", robots: { index: false } };

type Row = { label: string; ok: boolean; detail: string };

async function checkTables(): Promise<Row> {
  const db = supabasePublic();
  if (!db) {
    return {
      label: "표(테이블) 만들어짐",
      ok: false,
      detail: "Supabase 주소·키가 먼저 있어야 확인할 수 있어요.",
    };
  }
  const { error } = await db.from("class_settings").select("id").limit(1);
  if (!error) return { label: "표(테이블) 만들어짐", ok: true, detail: "정상" };
  return {
    label: "표(테이블) 만들어짐",
    ok: false,
    detail: `${error.message} — SQL 다섯 조각을 모두 실행했는지 확인하세요.`,
  };
}

export default async function SetupCheckPage() {
  const status = supabaseStatus();

  const rows: Row[] = [
    {
      label: "NEXT_PUBLIC_SUPABASE_URL",
      ok: status.urlValid,
      detail: !status.urlProvided
        ? "값이 비어 있어요. Vercel 환경변수에 추가하세요."
        : status.urlValid
          ? `${status.urlHost}`
          : "주소 형식이 아니에요. https://xxxx.supabase.co 전체를 넣어야 합니다.",
    },
    {
      label: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ok: status.anonKeyProvided,
      detail: status.anonKeyProvided ? "설정됨" : "값이 비어 있어요.",
    },
    {
      label: "SUPABASE_SERVICE_ROLE_KEY",
      ok: status.serviceKeyProvided,
      detail: status.serviceKeyProvided
        ? "설정됨"
        : "값이 비어 있어요. 관리자 기능이 동작하지 않습니다.",
    },
    {
      label: "ADMIN_PASSWORD",
      ok: isAdminPasswordConfigured(),
      detail: isAdminPasswordConfigured()
        ? "설정됨"
        : "값이 비어 있어요. /admin 로그인이 불가능합니다.",
    },
    await checkTables(),
  ];

  const allOk = rows.every((r) => r.ok);

  return (
    <>
      <PageTitle
        title="설정 점검"
        description="배포가 제대로 됐는지 확인하는 화면이에요."
      />

      <div
        className={`mb-4 rounded-2xl px-4 py-3.5 text-sm font-bold ${
          allOk
            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            : "bg-accent-50 text-amber-800 ring-1 ring-accent-400/40"
        }`}
      >
        {allOk
          ? "전부 정상이에요. 홈페이지를 그대로 쓰시면 됩니다 🎉"
          : "아직 채워지지 않은 항목이 있어요. 아래에서 ✕ 표시를 확인하세요."}
      </div>

      <ul className="card divide-y divide-slate-100">
        {rows.map((row) => (
          <li key={row.label} className="flex items-start gap-3 px-4 py-3.5">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                row.ok ? "bg-emerald-500" : "bg-rose-500"
              }`}
            >
              {row.ok ? "✓" : "✕"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="break-all font-mono text-[13px] font-semibold text-slate-800">
                {row.label}
              </p>
              <p className="mt-0.5 break-words text-sm text-slate-500">
                {row.detail}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-relaxed text-slate-500">
        <p className="font-bold text-slate-700">고친 다음에는</p>
        <p className="mt-1">
          Vercel에서 환경변수를 바꿨다면{" "}
          <b>Deployments → 맨 위 배포 → Redeploy</b>를 눌러야 반영됩니다. 값만
          저장하고 재배포하지 않으면 그대로예요.
        </p>
      </div>

      <Link
        href="/"
        className="mt-4 block text-center text-sm font-semibold text-slate-400 hover:text-brand-600"
      >
        ← 홈으로
      </Link>
    </>
  );
}
