import { ComplaintForm } from "@/components/ComplaintForm";
import { PageTitle } from "@/components/ui";
import { LockIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "익명 민원함" };

export default function ComplaintsPage() {
  return (
    <>
      <PageTitle
        title="익명 민원함"
        description="이름 없이 남기는 우리 반 건의함이에요."
      />

      <div className="mb-4 flex gap-3 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3.5">
        <LockIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <div className="text-sm leading-relaxed text-brand-700">
          <p className="font-bold">누가 썼는지 저장하지 않아요.</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-brand-600/90">
            <li>
              이름·학번·IP 주소 등 작성자를 알 수 있는 정보는 기록하지 않습니다.
            </li>
            <li>
              보낸 글은 목록에 공개되지 않고, 반장(관리자)만 볼 수 있어요.
            </li>
            <li>
              보낸 뒤에는 수정·삭제할 수 없으니 한 번 더 읽어보고 보내주세요.
            </li>
          </ul>
        </div>
      </div>

      <ComplaintForm />
    </>
  );
}
