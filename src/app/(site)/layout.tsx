import { SiteHeader } from "@/components/SiteHeader";
import { BottomNav } from "@/components/SiteNav";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, admin] = await Promise.all([getSettings(), isAdmin()]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader settings={settings} showAdminLink={admin} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-5 md:pb-12">
        {children}
      </main>

      <footer className="mx-auto hidden w-full max-w-3xl px-4 pb-8 text-xs text-slate-400 md:block">
        {settings.class_name} 학급 홈페이지
      </footer>

      <BottomNav />
    </div>
  );
}
