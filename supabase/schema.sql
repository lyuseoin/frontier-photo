-- =====================================================================
--  학급 홈페이지 — Supabase 스키마
--  Supabase Dashboard > SQL Editor 에 붙여넣고 실행하세요.
--  (여러 번 실행해도 안전하도록 IF NOT EXISTS / DROP POLICY IF EXISTS 사용)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. 공통: updated_at 자동 갱신 트리거 함수
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------
-- 1. class_settings — 학급 이름 등 사이트 설정 (항상 1행만 사용)
-- ---------------------------------------------------------------------
create table if not exists public.class_settings (
  id           smallint     primary key default 1,
  class_name   text         not null default '1학년 1반',
  school_name  text         not null default '',
  tagline      text         not null default '',
  updated_at   timestamptz  not null default now(),
  constraint class_settings_single_row check (id = 1)
);

insert into public.class_settings (id, class_name, school_name, tagline)
values (1, '1학년 1반', '', '우리 반 공지·일정·시간표를 한 곳에서')
on conflict (id) do nothing;

drop trigger if exists trg_class_settings_updated_at on public.class_settings;
create trigger trg_class_settings_updated_at
  before update on public.class_settings
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 2. notices — 공지사항
-- ---------------------------------------------------------------------
create table if not exists public.notices (
  id          uuid         primary key default gen_random_uuid(),
  title       text         not null,
  content     text         not null default '',
  is_pinned   boolean      not null default false,   -- 상단 고정
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

create index if not exists notices_pinned_created_idx
  on public.notices (is_pinned desc, created_at desc);

drop trigger if exists trg_notices_updated_at on public.notices;
create trigger trg_notices_updated_at
  before update on public.notices
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 3. events — 일정 (시험 / 수행평가 / 행사)
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'event_category') then
    create type public.event_category as enum ('exam', 'assignment', 'activity');
  end if;
end
$$;

create table if not exists public.events (
  id          uuid                  primary key default gen_random_uuid(),
  title       text                  not null,
  category    public.event_category not null default 'activity',
  start_date  date                  not null,
  end_date    date,                 -- 여러 날 이어지는 일정이면 종료일 (없으면 하루짜리)
  description text                  not null default '',
  created_at  timestamptz           not null default now(),
  updated_at  timestamptz           not null default now(),
  constraint events_date_order check (end_date is null or end_date >= start_date)
);

create index if not exists events_start_date_idx on public.events (start_date);

drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 4. timetable — 시간표 (요일 1=월 ~ 5=금, 교시 1~8)
-- ---------------------------------------------------------------------
create table if not exists public.timetable (
  id           uuid         primary key default gen_random_uuid(),
  day_of_week  smallint     not null check (day_of_week between 1 and 5),
  period       smallint     not null check (period between 1 and 8),
  subject      text         not null,
  teacher      text         not null default '',
  room         text         not null default '',
  updated_at   timestamptz  not null default now(),
  unique (day_of_week, period)
);

drop trigger if exists trg_timetable_updated_at on public.timetable;
create trigger trg_timetable_updated_at
  before update on public.timetable
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 5. complaints — 익명 민원함
--    ⚠️ 작성자를 특정할 수 있는 값(IP, User-Agent, 세션ID, 이름 등)은
--       컬럼 자체를 두지 않습니다. 애플리케이션도 본문/분류만 저장합니다.
-- ---------------------------------------------------------------------
create table if not exists public.complaints (
  id          uuid         primary key default gen_random_uuid(),
  category    text         not null default '기타',
  content     text         not null,
  is_handled  boolean      not null default false,  -- 관리자 '확인 완료' 표시
  handled_at  timestamptz,
  admin_memo  text         not null default '',
  created_at  timestamptz  not null default now()
);

create index if not exists complaints_created_idx on public.complaints (created_at desc);


-- =====================================================================
--  RLS (Row Level Security)
--  - 익명(anon) 키: 공개 콘텐츠 읽기 + 민원 '작성만' 가능
--  - 관리자 기능은 service_role 키로만 동작 (service_role은 RLS를 우회)
-- =====================================================================
alter table public.class_settings enable row level security;
alter table public.notices        enable row level security;
alter table public.events         enable row level security;
alter table public.timetable      enable row level security;
alter table public.complaints     enable row level security;

-- 공개 읽기 (누구나 열람)
drop policy if exists "public read class_settings" on public.class_settings;
create policy "public read class_settings" on public.class_settings
  for select to anon, authenticated using (true);

drop policy if exists "public read notices" on public.notices;
create policy "public read notices" on public.notices
  for select to anon, authenticated using (true);

drop policy if exists "public read events" on public.events;
create policy "public read events" on public.events
  for select to anon, authenticated using (true);

drop policy if exists "public read timetable" on public.timetable;
create policy "public read timetable" on public.timetable
  for select to anon, authenticated using (true);

-- 민원: 작성(INSERT)만 허용. SELECT/UPDATE/DELETE 정책이 없으므로
--       anon 키로는 다른 사람의 민원을 절대 읽을 수 없습니다.
drop policy if exists "anyone can submit complaint" on public.complaints;
create policy "anyone can submit complaint" on public.complaints
  for insert to anon, authenticated with check (true);

-- 참고: class_settings / notices / events / timetable 에 대한
--       INSERT·UPDATE·DELETE 정책은 일부러 만들지 않습니다.
--       등록·수정·삭제는 서버(관리자 로그인 후)에서 service_role 키로만 수행됩니다.
