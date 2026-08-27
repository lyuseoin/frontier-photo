import { AdminTimetable } from "@/components/admin/AdminTimetable";
import { PageTitle } from "@/components/ui";
import { getTimetable } from "@/lib/data";
import { todayWeekdayKST } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function AdminTimetablePage() {
  const slots = await getTimetable();
  const weekday = todayWeekdayKST();
  const todayColumn = weekday >= 1 && weekday <= 5 ? weekday : null;

  return (
    <>
      <PageTitle
        title="시간표 관리"
        description="요일을 고르고 교시별 과목을 입력한 뒤 저장하세요."
      />
      <AdminTimetable slots={slots} todayColumn={todayColumn} />
    </>
  );
}
