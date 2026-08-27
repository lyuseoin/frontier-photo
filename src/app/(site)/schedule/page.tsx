import { ScheduleView } from "@/components/ScheduleView";
import { PageTitle, SetupNotice } from "@/components/ui";
import { AdminEditBar } from "@/components/AdminEditBar";
import { AdminEvents } from "@/components/admin/AdminEvents";
import { isAdmin } from "@/lib/auth";
import { getEvents } from "@/lib/data";
import { todayKST } from "@/lib/date";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "일정" };

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const [{ edit }, events, admin] = await Promise.all([
    searchParams,
    getEvents(),
    isAdmin(),
  ]);
  const editing = admin && edit === "1";
  const today = todayKST();

  return (
    <>
      {!isSupabaseConfigured() ? <SetupNotice /> : null}
      <PageTitle
        title="일정"
        description="시험 · 수행평가 · 학교 행사를 한눈에 확인하세요."
      />

      {admin ? (
        <AdminEditBar editing={editing} basePath="/schedule" what="일정" />
      ) : null}

      {editing ? (
        <AdminEvents events={events} today={today} />
      ) : (
        <ScheduleView events={events} today={today} />
      )}
    </>
  );
}
