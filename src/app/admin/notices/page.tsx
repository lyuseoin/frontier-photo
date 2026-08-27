import { AdminNotices } from "@/components/admin/AdminNotices";
import { PageTitle } from "@/components/ui";
import { getNotices } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminNoticesPage() {
  const notices = await getNotices();
  return (
    <>
      <PageTitle
        title="공지 관리"
        description="중요한 안내는 상단 고정으로 올려두세요."
      />
      <AdminNotices notices={notices} />
    </>
  );
}
