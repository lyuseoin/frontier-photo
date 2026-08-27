/** 서버 액션 ↔ 폼 사이에서 주고받는 공통 상태 */
export type ActionState = { ok: boolean; message: string };

export const idleState: ActionState = { ok: false, message: "" };

export type ComplaintFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialComplaintState: ComplaintFormState = {
  status: "idle",
  message: "",
};
