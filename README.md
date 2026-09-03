# 학급 홈페이지

우리 반 공지 · 일정 · 시간표 · 익명 민원함을 한곳에 모은 모바일 우선 웹사이트입니다.
반 친구들은 로그인 없이 보고, **반장(관리자)** 만 비밀번호로 들어가 내용을 관리합니다.

- **프레임워크**: Next.js 15 (App Router) + TypeScript
- **스타일**: Tailwind CSS (모바일 우선 반응형)
- **데이터베이스**: Supabase (무료 플랜)
- **배포**: Vercel

---

## 1. 화면 구성

| 경로 | 화면 | 설명 |
| --- | --- | --- |
| `/` | 홈 | 오늘 날짜 기준 다가오는 일정 D-day, 최신 공지 3건 요약 |
| `/schedule` | 일정 | 달력 보기 · 목록 보기 전환, 시험/수행/행사 카테고리 색 구분·필터 |
| `/notices` | 공지사항 | 고정 공지가 상단에, 클릭하면 상세 화면 |
| `/timetable` | 시간표 | 요일별 표, 오늘 요일 강조 |
| `/complaints` | 익명 민원함 | 작성 폼만 제공 (제출 내용은 공개되지 않음) |
| `/admin` | 관리자 | 비밀번호 로그인 후 등록·수정·삭제, 민원 열람 |
| `/setup-check` | 설정 점검 | 환경변수·테이블이 제대로 준비됐는지 확인 (검색 노출 안 함) |

관리자 메뉴 링크는 **로그인한 관리자에게만** 헤더에 나타납니다. 일반 사용자 화면에는
`/admin`으로 가는 링크가 어디에도 없고, `/admin`에 직접 들어와도 로그인 화면만 보입니다.

### 익명 민원함의 익명성

- `complaints` 테이블에는 **분류·본문·작성 시각**만 저장합니다.
- IP 주소, User-Agent, 쿠키, 세션 ID처럼 작성자를 특정할 수 있는 값은 **컬럼 자체가 없고
  서버에서 읽지도 않습니다.**
- RLS 정책상 익명 키(anon)로는 민원을 **작성만** 할 수 있고 조회할 수 없습니다.
  조회는 서버에서 관리자 로그인을 확인한 뒤 `service_role` 키로만 이뤄집니다.

---

## 2. Supabase 준비하기

### 2-1. 프로젝트 만들기

1. <https://supabase.com> 가입 후 **New project** 생성 (무료 플랜, 리전은 `Northeast Asia (Seoul)` 권장)
2. 프로젝트가 만들어질 때까지 1~2분 기다립니다.

### 2-2. 테이블 만들기

1. 왼쪽 메뉴에서 **SQL Editor → New query**
2. 이 저장소의 [`supabase/schema.sql`](supabase/schema.sql) 내용을 통째로 붙여넣고 **Run**
3. 화면이 어떻게 보이는지 먼저 보고 싶다면 [`supabase/seed.sql`](supabase/seed.sql)(샘플 데이터)도
   같은 방법으로 실행하세요. (선택 사항, 나중에 지워도 됩니다)

만들어지는 테이블은 다음 5개입니다.

| 테이블 | 용도 | 주요 컬럼 |
| --- | --- | --- |
| `class_settings` | 학급 이름 등 사이트 설정 (1행 고정) | `class_name`, `school_name`, `tagline` |
| `notices` | 공지사항 | `title`, `content`, `is_pinned` |
| `events` | 일정 | `title`, `category`(exam·assignment·activity), `start_date`, `end_date` |
| `timetable` | 시간표 | `day_of_week`(1=월~5=금), `period`(1~8), `subject`, `teacher`, `room` |
| `complaints` | 익명 민원 | `category`, `content`, `is_handled`, `admin_memo` |

### 2-3. 키 확인하기

**Project Settings → API** 에서 아래 3가지를 복사해 둡니다.

- Project URL
- `anon` `public` 키
- `service_role` 키 ← **절대 외부에 공유하면 안 되는 키**

---

## 3. 환경변수

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | anon(public) 키. 공개 콘텐츠 읽기·민원 작성용 |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | service_role 키. 관리자 등록·수정·삭제와 민원 열람에만 서버에서 사용 |
| `ADMIN_PASSWORD` | ✅ | `/admin` 로그인 비밀번호 |
| `ADMIN_SESSION_SECRET` | ⬜ | 로그인 쿠키 서명용 비밀값. 비우면 `ADMIN_PASSWORD`를 사용 (`openssl rand -base64 32`로 생성 권장) |

> ⚠️ `service_role` 키에는 절대 `NEXT_PUBLIC_` 접두사를 붙이지 마세요. 붙이면 브라우저로
> 새어 나가 누구나 DB 전체를 고칠 수 있게 됩니다.

> ⚠️ `NEXT_PUBLIC_SUPABASE_URL`은 `https://xxxxxxxx.supabase.co` **주소 전체**여야 합니다.
> 프로젝트 ID만 넣거나 `https://`를 빠뜨리면 사이트가 뜨지 않습니다.
> 배포 후 `/setup-check` 에 들어가면 어떤 값이 잘못됐는지 바로 확인할 수 있습니다.

`.env.example`을 복사해 값을 채우면 됩니다.

```bash
cp .env.example .env.local
```

---

## 4. 로컬에서 실행하기

```bash
npm install
cp .env.example .env.local   # 값을 채워 넣기
npm run dev                  # http://localhost:3000
```

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 빌드 결과 실행 |
| `npm run typecheck` | 타입 검사 |

---

## 5. Vercel 배포 순서

1. **GitHub에 올리기** — 이 저장소를 GitHub에 push 합니다.
2. **Vercel 접속** — <https://vercel.com> 에 GitHub 계정으로 로그인 → **Add New → Project**
3. **저장소 선택** — Framework Preset이 `Next.js`로 자동 인식되는지 확인합니다. 빌드 명령·출력
   디렉터리는 기본값 그대로 두면 됩니다.
4. **환경변수 입력** — 배포 화면의 *Environment Variables* 에 위 표의 5개 값을 넣습니다.
   (이미 배포한 뒤라면 **Settings → Environment Variables**)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET` *(선택)*
5. **Deploy** — 1~2분 뒤 `https://프로젝트이름.vercel.app` 주소가 나옵니다.
6. **관리자 로그인** — `https://주소/admin` 에 들어가 `ADMIN_PASSWORD`로 로그인합니다.
7. **초기 설정** — 관리자 → **설정**에서 학급 이름을 바꾸고, **공지 / 일정 / 시간표**를 등록합니다.
8. **친구들에게 공유** — 홈 주소만 알려주면 됩니다. 관리자 메뉴는 보이지 않습니다.

> 환경변수를 나중에 바꾸면 **Deployments → 최신 배포 → Redeploy** 를 눌러야 반영됩니다.

---

## 6. 관리자 사용법

| 메뉴 | 할 수 있는 일 |
| --- | --- |
| 요약 | 공지 수, 다가오는 일정, 미확인 민원 수 확인 |
| 공지 | 공지 등록·수정·삭제, **상단 고정** 켜고 끄기 |
| 일정 | 시험/수행/행사 등록·수정·삭제 (여러 날 일정은 종료일 입력) |
| 시간표 | 요일 탭을 고르고 교시별 과목·장소·선생님 입력 후 저장 (과목을 비우고 저장하면 그 교시 삭제) |
| 민원함 | 제출 내역 열람, **확인 완료** 표시, 관리자 메모, 삭제 |
| 설정 | 학급 이름 · 학교 이름 · 한 줄 소개 변경 |

- 로그인 세션은 **12시간** 뒤 자동으로 만료됩니다.
- 비밀번호를 바꾸려면 Vercel 환경변수 `ADMIN_PASSWORD`를 수정하고 재배포하세요.
  (`ADMIN_SESSION_SECRET`을 따로 지정하지 않았다면 비밀번호를 바꾸는 순간 기존 로그인도 풀립니다.)

---

## 7. 폴더 구조

```
src/
├─ app/
│  ├─ (site)/                 # 친구들이 보는 화면
│  │  ├─ page.tsx             #   홈 (D-day, 최신 공지)
│  │  ├─ schedule/            #   일정 (달력 / 목록)
│  │  ├─ notices/             #   공지 목록 + 상세
│  │  ├─ timetable/           #   시간표
│  │  └─ complaints/          #   익명 민원함 (작성 폼 + 서버 액션)
│  ├─ admin/                  # 관리자 화면 (레이아웃에서 로그인 검사)
│  │  └─ actions.ts           #   등록·수정·삭제 서버 액션 (전부 관리자 확인 후 실행)
│  ├─ layout.tsx
│  └─ robots.ts               # /admin 검색엔진 수집 차단
├─ components/                # 화면 조각 (public / admin)
└─ lib/
   ├─ auth.ts                 # 비밀번호 검증 + 서명된 세션 쿠키
   ├─ supabase.ts             # anon 클라이언트 / service_role 클라이언트
   ├─ data.ts                 # 공개 데이터 조회
   ├─ adminData.ts            # 민원 등 관리자 전용 조회
   ├─ date.ts                 # 한국 시간 기준 날짜·D-day 계산
   └─ types.ts                # 타입 · 카테고리 색상 정의
supabase/
├─ schema.sql                 # 테이블 + RLS 생성 SQL
└─ seed.sql                   # (선택) 샘플 데이터
```

---

## 8. 보안 메모

- 관리자 인증은 서버에서만 확인합니다. 관리자 화면 레이아웃과 **모든 등록·수정·삭제 서버
  액션이 각각 세션을 다시 검사**하므로, 주소를 직접 입력하거나 요청을 위조해도 통과하지 못합니다.
- 로그인 쿠키는 `httpOnly` + `SameSite=Lax` + 서명(HMAC-SHA256) + 12시간 만료입니다.
- 공개 페이지는 `anon` 키만 사용하고, `service_role` 키는 서버 코드에서만 참조합니다.

---

## 부록. 세계 문화 견본첩 (문화 탐구 활동 안내)

`public/culture/index.html` — 여섯 나라(페루·모로코·인도네시아·몽골·가나·멕시코)의 문화를
견본첩처럼 펼쳐 보고, 다섯 역할로 나눠 직접 체험하는 활동 안내 페이지입니다.

- **경로**: 배포 후 `/culture/` 로 접속 (Next.js `public/` 정적 파일)
- **구성**: 활동의 뜻 · 여섯 나라 견본 · 역할 분담 5종 · 4차시 진행 순서 ·
  문화적 감수성 5가지 약속 · 준비물 점검표 · 마무리 기록 문장
- **의존성 없음**: 빌드나 Supabase 설정 없이 파일 하나로 열립니다. 브라우저에서
  `public/culture/index.html`을 직접 열어도 그대로 동작합니다.
- 준비물 점검표의 체크 상태는 그 기기의 `localStorage`에만 저장되며 서버로 전송되지 않습니다.
