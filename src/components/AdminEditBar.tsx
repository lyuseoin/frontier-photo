import Link from "next/link";
import { SettingsIcon } from "@/components/icons";

/**
 * 로그인한 관리자에게만 보이는 편집 전환 바.
 * 같은 화면에서 ?edit=1 로 들어가면 그 자리에서 바로 고칠 수 있다.
 * 일반 사용자에게는 이 컴포넌트 자체가 렌더되지 않는다.
 */
export function AdminEditBar({
  editing,
  basePath,
  what,
}: {
  editing: boolean;
  basePath: string;
  what: string;
}) {
  return (
    <div
      className={`mb-4 flex items-center gap-3 rounded-2xl px-4 py-3 ${
        editing
          ? "bg-brand-600 text-white"
          : "border border-brand-100 bg-brand-50 text-brand-700"
      }`}
    >
      <SettingsIcon className="h-5 w-5 shrink-0" />
      <p className="min-w-0 flex-1 text-sm font-bold">
        {editing ? `${what} 편집 중` : "반장님만 보이는 메뉴예요"}
      </p>
      <Link
        href={editing ? basePath : `${basePath}?edit=1`}
        className={`shrink-0 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
          editing
            ? "bg-white text-brand-700 hover:bg-brand-50"
            : "bg-brand-600 text-white hover:bg-brand-700"
        }`}
      >
        {editing ? "편집 끝내기" : `${what} 편집`}
      </Link>
    </div>
  );
}
