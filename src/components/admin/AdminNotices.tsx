"use client";

import { useActionState, useEffect, useState } from "react";
import { deleteNotice, saveNotice, toggleNoticePin } from "@/app/admin/actions";
import { idleState } from "@/lib/actionState";
import {
  ConfirmButton,
  FormMessage,
  SubmitButton,
} from "@/components/admin/formBits";
import { PinIcon } from "@/components/icons";
import { formatTimestampKo } from "@/lib/date";
import type { Notice } from "@/lib/types";

export function AdminNotices({
  notices,
  openId = null,
}: {
  notices: Notice[];
  /** 공지 상세에서 '수정'으로 들어온 경우 그 공지의 폼을 바로 펼친다 */
  openId?: string | null;
}) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(openId);

  return (
    <div className="space-y-4">
      {creating ? (
        <NoticeForm
          key="new"
          onDone={() => setCreating(false)}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="btn-primary w-full"
        >
          + 새 공지 작성
        </button>
      )}

      {notices.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
          등록된 공지가 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {notices.map((notice) =>
            editingId === notice.id ? (
              <li key={notice.id}>
                <NoticeForm
                  notice={notice}
                  onDone={() => setEditingId(null)}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li key={notice.id} className="card px-4 py-3.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {notice.is_pinned ? (
                        <PinIcon className="h-3.5 w-3.5 shrink-0 text-accent-500" />
                      ) : null}
                      <p className="truncate font-bold text-slate-900">
                        {notice.title}
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {formatTimestampKo(notice.created_at)}
                    </p>
                    {notice.content ? (
                      <p className="mt-1.5 line-clamp-2 whitespace-pre-wrap text-sm text-slate-600">
                        {notice.content}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={toggleNoticePin}>
                    <input type="hidden" name="id" value={notice.id} />
                    <input
                      type="hidden"
                      name="next"
                      value={String(!notice.is_pinned)}
                    />
                    <SubmitButton
                      className={
                        notice.is_pinned
                          ? "btn bg-accent-100 text-accent-600 px-3 py-2 text-xs"
                          : "btn-ghost px-3 py-2 text-xs"
                      }
                      pendingLabel="…"
                    >
                      {notice.is_pinned ? "고정 해제" : "상단 고정"}
                    </SubmitButton>
                  </form>

                  <button
                    type="button"
                    onClick={() => setEditingId(notice.id)}
                    className="btn-ghost px-3 py-2 text-xs"
                  >
                    수정
                  </button>

                  <form action={deleteNotice} className="ml-auto">
                    <input type="hidden" name="id" value={notice.id} />
                    <ConfirmButton
                      message={`'${notice.title}' 공지를 삭제할까요?`}
                      className="btn-danger px-3 py-2 text-xs"
                    >
                      삭제
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

function NoticeForm({
  notice,
  onDone,
  onCancel,
}: {
  notice?: Notice;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(saveNotice, idleState);

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="card space-y-3 px-4 py-4">
      {notice ? <input type="hidden" name="id" value={notice.id} /> : null}

      <div>
        <label className="label" htmlFor={`title-${notice?.id ?? "new"}`}>
          제목
        </label>
        <input
          id={`title-${notice?.id ?? "new"}`}
          name="title"
          className="field"
          required
          maxLength={120}
          defaultValue={notice?.title ?? ""}
          placeholder="예) 3월 학급 회의 안내"
        />
      </div>

      <div>
        <label className="label" htmlFor={`content-${notice?.id ?? "new"}`}>
          내용
        </label>
        <textarea
          id={`content-${notice?.id ?? "new"}`}
          name="content"
          rows={6}
          className="field resize-none leading-relaxed"
          defaultValue={notice?.content ?? ""}
          placeholder="공지 내용을 적어주세요."
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input
          type="checkbox"
          name="is_pinned"
          defaultChecked={notice?.is_pinned ?? false}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
        />
        상단에 고정하기
      </label>

      <FormMessage state={state} />

      <div className="flex gap-2">
        <SubmitButton className="btn-primary flex-1">
          {notice ? "수정 저장" : "공지 등록"}
        </SubmitButton>
        <button type="button" onClick={onCancel} className="btn-ghost">
          취소
        </button>
      </div>
    </form>
  );
}
