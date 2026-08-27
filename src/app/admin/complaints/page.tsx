import { AdminComplaints } from "@/components/admin/AdminComplaints";
import { PageTitle } from "@/components/ui";
import { getComplaints } from "@/lib/adminData";

export const dynamic = "force-dynamic";

export default async function AdminComplaintsPage() {
  const complaints = await getComplaints();

  return (
    <>
      <PageTitle
        title="익명 민원함"
        description="반장만 볼 수 있는 화면이에요. 작성자 정보는 저장되지 않습니다."
      />
      <AdminComplaints complaints={complaints} />
    </>
  );
}
