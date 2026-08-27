import Link from "next/link";
import { notFound } from "next/navigation";
import { PinIcon } from "@/components/icons";
import { isAdmin } from "@/lib/auth";
import { getNotice } from "@/lib/data";
import { formatTimestampKo } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [notice, admin] = await Promise.all([getNotice(id), isAdmin()]);
  if (!notice) notFound();

  return (
    <article>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href="/notices"
          className="text-sm font-semibold text-slate-400 hover:text-brand-600"
        >
          ← 공지사항
        </Link>
        {admin ? (
          <Link
            href={`/notices?edit=1&open=${notice.id}`}
            className="shrink-0 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-bold text-white hover:bg-brand-700"
          >
            이 공지 수정
          </Link>
        ) : null}
      </div>

      <header className="mb-4 border-b border-slate-200 pb-4">
        {notice.is_pinned ? (
          <span className="mb-1.5 inline-flex items-center gap-1 rounded-md bg-accent-50 px-1.5 py-0.5 text-[11px] font-bold text-accent-600 ring-1 ring-accent-400/40">
            <PinIcon className="h-3 w-3" />
            고정
          </span>
        ) : null}
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
          {notice.title}
        </h1>
        <p className="mt-1.5 text-xs text-slate-400">
          {formatTimestampKo(notice.created_at)}
        </p>
      </header>

      <div className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
        {notice.content || "내용이 없습니다."}
      </div>
    </article>
  );
}
