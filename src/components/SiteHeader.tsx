import Link from "next/link";
import { SettingsIcon } from "@/components/icons";
import type { ClassSettings } from "@/lib/types";

export function SiteHeader({
  settings,
  showAdminLink,
}: {
  settings: ClassSettings;
  showAdminLink: boolean;
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3.5">
        <Link href="/" className="min-w-0">
          {settings.school_name ? (
            <p className="truncate text-xs font-medium text-slate-400">
              {settings.school_name}
            </p>
          ) : null}
          <p className="truncate text-lg font-extrabold tracking-tight text-slate-900">
            {settings.class_name}
            <span className="ml-1.5 text-brand-600">건의함</span>
          </p>
        </Link>

        {/* 관리자 메뉴는 로그인한 관리자에게만 노출 */}
        {showAdminLink ? (
          <Link
            href="/admin"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 ring-1 ring-brand-100"
          >
            <SettingsIcon className="h-4 w-4" />
            관리자
          </Link>
        ) : null}
      </div>
    </header>
  );
}
