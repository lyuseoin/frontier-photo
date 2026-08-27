-- =====================================================================
--  (선택) 샘플 데이터 — 화면이 어떻게 보이는지 확인해 보고 싶을 때만 실행하세요.
--  실제 운영 전에는 아래 3개 테이블을 비우고 시작하는 것을 권장합니다.
--    delete from public.events;
--    delete from public.notices;
--    delete from public.timetable;
-- =====================================================================

update public.class_settings
set class_name = '2학년 3반',
    school_name = '',
    tagline = '공지 · 일정 · 시간표를 한 곳에서'
where id = 1;

insert into public.notices (title, content, is_pinned) values
  ('학급 문고 이용 안내',
   E'교실 뒤 책장에 학급 문고가 생겼어요.\n\n· 빌릴 때는 대여 노트에 이름과 날짜를 적어주세요.\n· 반납 기한은 2주입니다.',
   true),
  ('체육대회 반티 투표 결과',
   E'투표 결과 2번 디자인으로 결정되었습니다.\n사이즈 조사는 이번 주 금요일까지 반장에게 알려주세요.',
   false),
  ('청소 당번 순번 변경',
   '다음 주부터 청소 당번이 번호순에서 분단순으로 바뀝니다.',
   false);

insert into public.events (title, category, start_date, end_date, description) values
  ('1학기 기말고사', 'exam',
   (current_date + 14)::date, (current_date + 17)::date,
   '1~4교시, 시험 범위는 공지 참고'),
  ('국어 수행평가 (발표)', 'assignment',
   (current_date + 5)::date, null,
   '3분 발표, 대본은 전날까지 제출'),
  ('체육대회', 'activity',
   (current_date + 25)::date, null,
   '운동장, 우천 시 강당'),
  ('학급 회의', 'activity',
   (current_date + 2)::date, null,
   '6교시 교실');

insert into public.timetable (day_of_week, period, subject, teacher, room) values
  (1, 1, '국어', '', ''), (1, 2, '수학', '', ''), (1, 3, '영어', '', ''),
  (1, 4, '과학', '', '과학실'), (1, 5, '체육', '', '운동장'), (1, 6, '창체', '', ''),
  (2, 1, '수학', '', ''), (2, 2, '국어', '', ''), (2, 3, '사회', '', ''),
  (2, 4, '음악', '', '음악실'), (2, 5, '영어', '', ''), (2, 6, '자율', '', ''),
  (3, 1, '영어', '', ''), (3, 2, '과학', '', '과학실'), (3, 3, '수학', '', ''),
  (3, 4, '국어', '', ''), (3, 5, '미술', '', '미술실'), (3, 6, '미술', '', '미술실'),
  (4, 1, '사회', '', ''), (4, 2, '영어', '', ''), (4, 3, '체육', '', '운동장'),
  (4, 4, '수학', '', ''), (4, 5, '국어', '', ''), (4, 6, '동아리', '', ''),
  (5, 1, '과학', '', '과학실'), (5, 2, '사회', '', ''), (5, 3, '국어', '', ''),
  (5, 4, '수학', '', ''), (5, 5, '영어', '', ''), (5, 6, '창체', '', '')
on conflict (day_of_week, period) do update
  set subject = excluded.subject,
      teacher = excluded.teacher,
      room = excluded.room;
