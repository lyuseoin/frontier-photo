"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarIcon,
  GridIcon,
  HomeIcon,
  MailIcon,
  MegaphoneIcon,
} from "@/components/icons";

const NAV = [
  { href: "/", label: "홈", Icon: HomeIcon },
  { href: "/schedule", label: "일정", Icon: CalendarIcon },
  { href: "/notices", label: "공지", Icon: MegaphoneIcon },
  { href: "/timetable", label: "시간표", Icon: GridIcon },
  { href: "/complaints", label: "민원함", Icon: MailIcon },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** 데스크톱: 헤더 아래 가로 탭 */
export function TopNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:block">
      <ul className="mx-auto flex max-w-3xl gap-1 px-4">
        {NAV.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** 모바일: 하단 고정 탭바 */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-3xl">
        {NAV.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2.5 text-[11px] font-semibold transition ${
                  active ? "text-brand-600" : "text-slate-400"
                }`}
              >
                <Icon className="h-[22px] w-[22px]" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
