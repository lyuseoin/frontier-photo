import { SiteHeader } from "@/components/SiteHeader";
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

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-lg px-4 pb-8 text-xs text-slate-400">
        {settings.class_name} 익명 건의함
      </footer>
    </div>
  );
}
