-- =====================================================================
--  (선택) 예전 버전에서 만든 공지·일정·시간표 표를 지웁니다.
--  건의함만 쓰기로 했다면 그냥 두어도 아무 문제 없습니다.
--  정리하고 싶을 때만 SQL Editor 에 붙여넣고 Run 하세요.
-- =====================================================================
drop table if exists public.notices cascade;
drop table if exists public.events cascade;
drop table if exists public.timetable cascade;
drop type  if exists public.event_category;

-- 예전 스키마에서 쓰던 트리거 함수도 함께 정리합니다.
drop function if exists public.set_updated_at() cascade;
