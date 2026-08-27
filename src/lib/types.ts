export type ClassSettings = {
  id: number;
  class_name: string;
  school_name: string;
  tagline: string;
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

export const COMPLAINT_CATEGORIES = [
  "학급 생활",
  "수업·학습",
  "시설·환경",
  "건의사항",
  "기타",
] as const;
