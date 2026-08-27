import Link from "next/link";
import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { LoginScreen } from "@/components/admin/LoginScreen";
import { logout } from "@/app/admin/actions";
import { isAdmin, isAdminPasswordConfigured } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();
  if (!admin) return <LoginScreen configured={isAdminPasswordConfigured()} />;

  const settings = await getSettings();

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3.5">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-400">
              {settings.class_name}
            </p>
            <p className="text-lg font-extrabold tracking-tight text-slate-900">
              관리자 페이지
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              홈페이지
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full px-3 py-1.5 text-xs font-bold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <AdminNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">
        {children}
      </main>
    </div>
  );
}
