import Link from "next/link";
import { SettingsIcon } from "@/components/icons";

const LINKS = [
  { href: "/notices?edit=1", label: "공지" },
  { href: "/schedule?edit=1", label: "일정" },
  { href: "/timetable?edit=1", label: "시간표" },
  { href: "/admin/complaints", label: "민원함" },
  { href: "/admin/settings", label: "학급 이름" },
];

/** 홈에서 관리자에게만 보이는 편집 진입점 */
export function AdminHomeStrip({ unhandled }: { unhandled: number }) {
  return (
    <section className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3.5">
      <div className="mb-2.5 flex items-center gap-2 text-brand-700">
        <SettingsIcon className="h-4 w-4" />
        <p className="text-sm font-bold">반장님만 보이는 메뉴</p>
        {unhandled > 0 ? (
          <span className="ml-auto rounded-full bg-accent-500 px-2 py-0.5 text-[11px] font-bold text-white">
            새 민원 {unhandled}
          </span>
        ) : null}
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex rounded-xl bg-white px-3 py-2 text-sm font-bold text-brand-700 ring-1 ring-brand-100 transition hover:bg-brand-600 hover:text-white"
            >
              {link.label} 편집
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
