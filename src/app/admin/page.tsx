import { AdminComplaints } from "@/components/admin/AdminComplaints";
import { PageTitle } from "@/components/ui";
import { getComplaints } from "@/lib/adminData";
import { isAdminSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const complaints = await getComplaints();

  return (
    <>
      {!isAdminSupabaseConfigured() ? (
        <p className="mb-4 rounded-2xl border border-accent-400/40 bg-accent-50 px-4 py-3 text-sm font-semibold text-amber-700">
          SUPABASE_SERVICE_ROLE_KEY 환경변수가 없어 건의 내용을 불러올 수
          없습니다. README를 확인해 주세요.
        </p>
      ) : null}

      <PageTitle
        title="받은 건의"
        description="반장만 볼 수 있는 화면이에요. 작성자 정보는 저장되지 않습니다."
      />
      <AdminComplaints complaints={complaints} />
    </>
  );
}
