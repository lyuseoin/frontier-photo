export type EventCategory = "exam" | "assignment" | "activity";

export type ClassSettings = {
  id: number;
  class_name: string;
  school_name: string;
  tagline: string;
  updated_at: string;
};

export type Notice = {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type ClassEvent = {
  id: string;
  title: string;
  category: EventCategory;
  start_date: string; // YYYY-MM-DD
  end_date: string | null;
  description: string;
  created_at: string;
  updated_at: string;
};

export type TimetableSlot = {
  id: string;
  day_of_week: number; // 1(월) ~ 5(금)
  period: number; // 1 ~ 8
  subject: string;
  teacher: string;
  room: string;
  updated_at: string;
};

export type Complaint = {
  id: string;
  category: string;
  content: string;
  is_handled: boolean;
  handled_at: string | null;
  admin_memo: string;
  created_at: string;
};

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; dot: string; chip: string; bar: string }
> = {
  exam: {
    label: "시험",
    dot: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    bar: "bg-rose-500",
  },
  assignment: {
    label: "수행",
    dot: "bg-brand-500",
    chip: "bg-brand-50 text-brand-700 ring-1 ring-brand-200",
    bar: "bg-brand-500",
  },
  activity: {
    label: "행사",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    bar: "bg-emerald-500",
  },
};

export const COMPLAINT_CATEGORIES = [
  "학급 생활",
  "수업·학습",
  "시설·환경",
  "건의사항",
  "기타",
] as const;

export const DAY_LABELS = ["월", "화", "수", "목", "금"] as const;
