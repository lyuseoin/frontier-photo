import { AdminEvents } from "@/components/admin/AdminEvents";
import { PageTitle } from "@/components/ui";
import { getEvents } from "@/lib/data";
import { todayKST } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await getEvents();
  return (
    <>
      <PageTitle
        title="일정 관리"
        description="시험 · 수행평가 · 행사를 등록하면 홈의 D-day에 바로 반영돼요."
      />
      <AdminEvents events={events} today={todayKST()} />
    </>
  );
}
