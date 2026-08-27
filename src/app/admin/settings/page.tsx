import { AdminSettings } from "@/components/admin/AdminSettings";
import { PageTitle } from "@/components/ui";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <PageTitle
        title="설정"
        description="건의함 상단에 보이는 이름을 바꿀 수 있어요."
      />
      <AdminSettings settings={settings} />

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-relaxed text-slate-500">
        <p className="font-bold text-slate-700">관리자 비밀번호 변경</p>
        <p className="mt-1">
          비밀번호는 데이터베이스가 아니라 환경변수(<code>ADMIN_PASSWORD</code>
          )로 관리합니다. Vercel 프로젝트의 Settings → Environment Variables
          에서 값을 바꾸고 다시 배포하면 변경됩니다.
        </p>
      </div>
    </>
  );
}
