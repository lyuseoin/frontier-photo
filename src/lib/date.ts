const KST = "Asia/Seoul";

/** 오늘 날짜(한국 시간) — 'YYYY-MM-DD' */
export function todayKST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** 오늘 요일(한국 시간) — 0=일 ~ 6=토 */
export function todayWeekdayKST(): number {
  const short = new Intl.DateTimeFormat("en-US", {
    timeZone: KST,
    weekday: "short",
  }).format(new Date());
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(short);
}

/** 'YYYY-MM-DD' → UTC 기준 Date (시간대 흔들림 없이 날짜 계산용) */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

export function toDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** from 기준으로 to 까지 남은 일수 (음수면 지난 날짜) */
export function diffDays(from: string, to: string): number {
  const ms = parseDateKey(to).getTime() - parseDateKey(from).getTime();
  return Math.round(ms / 86_400_000);
}

/** D-day 문자열 */
export function dDayLabel(days: number): string {
  if (days === 0) return "D-DAY";
  if (days > 0) return `D-${days}`;
  return `D+${Math.abs(days)}`;
}

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

/** '3월 14일 (금)' */
export function formatDateKo(key: string, withYear = false): string {
  const d = parseDateKey(key);
  const base = `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${
    WEEKDAY_KO[d.getUTCDay()]
  })`;
  return withYear ? `${d.getUTCFullYear()}년 ${base}` : base;
}

/** 일정 기간 표시 — 하루면 하루, 여러 날이면 범위 */
export function formatRangeKo(start: string, end: string | null): string {
  if (!end || end === start) return formatDateKo(start);
  return `${formatDateKo(start)} ~ ${formatDateKo(end)}`;
}

/** 작성 시각을 '2026. 3. 14.' 형태로 (한국 시간) */
export function formatTimestampKo(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

/** 작성 시각을 분 단위까지 (관리자 화면용) */
export function formatTimestampFullKo(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

/** 해당 월의 달력 그리드(일요일 시작, 6주 42칸) 날짜 키 배열 */
export function buildMonthGrid(year: number, month: number): string[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const startOffset = first.getUTCDay(); // 0=일
  const cells: string[] = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(first.getTime());
    d.setUTCDate(1 - startOffset + i);
    cells.push(toDateKey(d));
  }
  return cells;
}

/** 일정이 특정 날짜에 걸쳐 있는지 */
export function coversDate(
  start: string,
  end: string | null,
  key: string,
): boolean {
  return key >= start && key <= (end ?? start);
}
