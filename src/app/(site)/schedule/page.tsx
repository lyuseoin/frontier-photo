import { ScheduleView } from "@/components/ScheduleView";
import { PageTitle, SetupNotice } from "@/components/ui";
import { getEvents } from "@/lib/data";
import { todayKST } from "@/lib/date";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "일정" };

export default async function SchedulePage() {
  const events = await getEvents();

  return (
    <>
      {!isSupabaseConfigured() ? <SetupNotice /> : null}
      <PageTitle
        title="일정"
        description="시험 · 수행평가 · 학교 행사를 한눈에 확인하세요."
      />
      <ScheduleView events={events} today={todayKST()} />
    </>
  );
}
