-- =====================================================================
--  익명 건의함 — Supabase 스키마
--  Supabase Dashboard > SQL Editor 에 붙여넣고 Run 하세요.
--  (여러 번 실행해도 안전합니다)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. class_settings — 건의함 상단에 보이는 이름 (항상 1행만 사용)
-- ---------------------------------------------------------------------
create table if not exists public.class_settings (
  id           smallint     primary key default 1,
  class_name   text         not null default '1학년 1반',
  school_name  text         not null default '',
  tagline      text         not null default '',
  updated_at   timestamptz  not null default now(),
  constraint class_settings_single_row check (id = 1)
);

insert into public.class_settings (id, class_name)
values (1, '1학년 1반')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 2. complaints — 익명 건의
--    ⚠️ 작성자를 특정할 수 있는 값(IP, User-Agent, 세션ID, 이름 등)은
--       컬럼 자체를 두지 않습니다. 앱도 분류와 본문만 저장합니다.
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

create index if not exists complaints_created_idx
  on public.complaints (created_at desc);

-- =====================================================================
--  RLS (Row Level Security)
--  - 익명(anon) 키: 이름 읽기 + 건의 '작성만' 가능
--  - 건의 열람은 service_role 키로만 (service_role 은 RLS 를 우회)
-- =====================================================================
alter table public.class_settings enable row level security;
alter table public.complaints     enable row level security;

drop policy if exists "public read class_settings" on public.class_settings;
create policy "public read class_settings" on public.class_settings
  for select to anon, authenticated using (true);

-- 건의: 작성(INSERT)만 허용. SELECT 정책이 없으므로 anon 키로는
--       다른 사람이 쓴 건의를 절대 읽을 수 없습니다.
drop policy if exists "anyone can submit complaint" on public.complaints;
create policy "anyone can submit complaint" on public.complaints
  for insert to anon, authenticated with check (true);

-- 참고: class_settings 의 UPDATE 정책과 complaints 의 SELECT/UPDATE/DELETE
--       정책은 일부러 만들지 않습니다. 관리자 동작은 서버에서 로그인을
--       확인한 뒤 service_role 키로만 수행됩니다.
