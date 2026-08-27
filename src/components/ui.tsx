import Link from "next/link";
import { CATEGORY_META, type EventCategory } from "@/lib/types";
import { ChevronRightIcon } from "@/components/icons";

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

export function SectionHeading({
  title,
  href,
  linkLabel = "전체보기",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-3">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {href ? (
        <Link
          href={href}
          className="flex items-center gap-0.5 text-xs font-semibold text-slate-400 hover:text-brand-600"
        >
          {linkLabel}
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

export function CategoryChip({ category }: { category: EventCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ${meta.chip}`}
    >
      {meta.label}
    </span>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
      {children}
    </div>
  );
}

export function SetupNotice() {
  return (
    <div className="mb-4 rounded-2xl border border-accent-400/40 bg-accent-50 px-4 py-3 text-sm text-amber-800">
      <p className="font-bold">Supabase 연결이 아직 설정되지 않았어요.</p>
      <p className="mt-1 leading-relaxed text-amber-700">
        README의 안내에 따라 <code>.env.local</code>(또는 Vercel 환경변수)에
        Supabase 주소와 키를 넣어주세요.
      </p>
    </div>
  );
}
