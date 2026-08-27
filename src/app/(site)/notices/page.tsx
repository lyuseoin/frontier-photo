import Link from "next/link";
import { ChevronRightIcon, PinIcon } from "@/components/icons";
import { EmptyState, PageTitle, SetupNotice } from "@/components/ui";
import { getNotices } from "@/lib/data";
import { formatTimestampKo } from "@/lib/date";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "공지사항" };

export default async function NoticesPage() {
  const notices = await getNotices();
  const pinned = notices.filter((n) => n.is_pinned);
  const rest = notices.filter((n) => !n.is_pinned);

  return (
    <>
      {!isSupabaseConfigured() ? <SetupNotice /> : null}
      <PageTitle
        title="공지사항"
        description="반에서 알려드리는 안내사항이에요."
      />

      {notices.length === 0 ? (
        <EmptyState>아직 등록된 공지가 없어요.</EmptyState>
      ) : (
        <div className="space-y-5">
          {pinned.length > 0 ? (
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-accent-600">
                <PinIcon className="h-3.5 w-3.5" />
                고정된 공지
              </h2>
              <ul className="space-y-2">
                {pinned.map((notice) => (
                  <li key={notice.id}>
                    <Link
                      href={`/notices/${notice.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-accent-400/40 bg-accent-50 px-4 py-3.5 transition hover:bg-accent-100"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-slate-900">
                          {notice.title}
                        </p>
                        <p className="mt-0.5 text-xs text-amber-700">
                          {formatTimestampKo(notice.created_at)}
                        </p>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 shrink-0 text-amber-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {rest.length > 0 ? (
            <section>
              {pinned.length > 0 ? (
                <h2 className="mb-2 text-sm font-bold text-slate-500">
                  전체 공지
                </h2>
              ) : null}
              <ul className="card divide-y divide-slate-100">
                {rest.map((notice) => (
                  <li key={notice.id}>
                    <Link
                      href={`/notices/${notice.id}`}
                      className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-slate-900">
                          {notice.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {formatTimestampKo(notice.created_at)}
                          {notice.content
                            ? ` · ${notice.content.replace(/\s+/g, " ")}`
                            : ""}
                        </p>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </>
  );
}
