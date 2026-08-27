const KST = "Asia/Seoul";

/** 받은 시각을 분 단위까지 (관리자 화면용) */
export function formatTimestampFullKo(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
