"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "요약" },
  { href: "/admin/notices", label: "공지" },
  { href: "/admin/events", label: "일정" },
  { href: "/admin/timetable", label: "시간표" },
  { href: "/admin/complaints", label: "민원함" },
  { href: "/admin/settings", label: "설정" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="-mx-4 overflow-x-auto px-4">
      <ul className="flex min-w-max gap-1.5 pb-1">
        {TABS.map(({ href, label }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`inline-flex rounded-full px-3.5 py-2 text-sm font-bold transition ${
                  active
                    ? "bg-brand-600 text-white"
                    : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-slate-800"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
