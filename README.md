# 익명 건의함

반 친구들이 **이름 없이** 건의를 남기고, **반장(관리자)만** 그 내용을 볼 수 있는
모바일 우선 웹사이트입니다.

- **프레임워크**: Next.js 15 (App Router) + TypeScript
- **스타일**: Tailwind CSS
- **데이터베이스**: Supabase (무료 플랜)
- **배포**: Vercel

---

## 1. 화면 구성

| 경로 | 화면 | 설명 |
| --- | --- | --- |
| `/` | 건의함 | 분류를 고르고 내용을 적어 보내는 폼. 보낸 글은 어디에도 공개되지 않습니다 |
| `/admin` | 받은 건의 | 비밀번호 로그인 후 열람, 확인 완료 표시, 메모, 삭제 |
| `/admin/settings` | 설정 | 상단에 표시할 학급 이름 변경 |
| `/setup-check` | 설정 점검 | 환경변수와 테이블이 제대로 준비됐는지 확인 (검색 노출 안 함) |

관리자 링크는 **로그인한 관리자에게만** 상단에 나타납니다. 일반 사용자 화면에는
`/admin`으로 가는 링크가 어디에도 없고, 직접 들어와도 로그인 화면만 보입니다.

### 익명성

- `complaints` 테이블에는 **분류·본문·받은 시각**만 저장합니다.
- IP 주소, User-Agent, 쿠키, 세션 ID처럼 작성자를 특정할 수 있는 값은
  **컬럼 자체가 없고 서버에서 읽지도 않습니다.**
- RLS 정책상 익명 키(anon)로는 건의를 **작성만** 할 수 있고 조회할 수 없습니다.
  조회는 서버에서 관리자 로그인을 확인한 뒤 `service_role` 키로만 이뤄집니다.
- 그 대가로 **IP 기반 도배 방지는 불가능**합니다. 봇 함정 필드와 글자 수
  제한(5~2000자)만 적용되어 있습니다.

---

## 2. Supabase 준비하기

1. <https://supabase.com> 가입 후 **New project** 생성 (무료 플랜, 리전은 `Northeast Asia (Seoul)` 권장)
2. 왼쪽 메뉴 **SQL Editor → New query**
3. [`supabase/schema.sql`](supabase/schema.sql) 내용을 붙여넣고 **Run**
   (60줄 남짓이라 폰에서도 한 번에 붙여넣을 수 있습니다. 여러 번 실행해도 안전합니다)
4. **Project Settings → API** 에서 아래 3가지를 복사

| 표 | 용도 | 주요 컬럼 |
| --- | --- | --- |
| `class_settings` | 상단에 보이는 이름 (1행 고정) | `class_name`, `school_name` |
| `complaints` | 익명 건의 | `category`, `content`, `is_handled`, `admin_memo` |

> 예전 버전에서 만든 `notices` · `events` · `timetable` 표가 남아 있어도 아무 문제
> 없습니다. 정리하고 싶으면 [`supabase/cleanup-unused.sql`](supabase/cleanup-unused.sql)을
> 실행하세요.

---

## 3. 환경변수

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | anon(public) 키. 이름 읽기·건의 작성용 |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | service_role 키. 건의 열람·수정에만 서버에서 사용 |
| `ADMIN_PASSWORD` | ✅ | `/admin` 로그인 비밀번호 |
| `ADMIN_SESSION_SECRET` | ⬜ | 로그인 쿠키 서명용 비밀값. 비우면 `ADMIN_PASSWORD` 사용 (`openssl rand -base64 32`) |

> ⚠️ `service_role` 키에는 절대 `NEXT_PUBLIC_` 접두사를 붙이지 마세요. 붙이면 브라우저로
> 새어 나가 누구나 DB 전체를 고칠 수 있게 됩니다.

> ⚠️ `NEXT_PUBLIC_SUPABASE_URL`은 `https://xxxxxxxx.supabase.co` **주소 전체**여야
> 합니다. 배포 후 `/setup-check` 에서 어떤 값이 잘못됐는지 바로 확인할 수 있습니다.

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

1. **GitHub에 올리기** — 이 저장소를 GitHub에 push
2. <https://vercel.com> 에 GitHub 계정으로 로그인 → **Add New → Project**
3. 저장소 선택 (Framework Preset이 `Next.js`로 자동 인식되는지 확인)
4. *Environment Variables* 에 위 표의 값을 입력
5. **Deploy** → 1~2분 뒤 `https://프로젝트이름.vercel.app` 주소가 나옵니다
6. `https://주소/admin` 에서 `ADMIN_PASSWORD`로 로그인 → 설정에서 학급 이름 변경
7. 친구들에게는 `/admin` 없는 **홈 주소만** 공유하면 됩니다

> 환경변수를 나중에 바꾸면 **Deployments → 최신 배포 → Redeploy** 를 눌러야 반영됩니다.

---

## 6. 관리자 사용법

- **받은 건의** — 전체 / 미확인 / 확인 완료로 걸러 보기, **확인 완료** 표시,
  관리자 메모, 삭제
- **설정** — 상단에 표시할 학급 이름 · 학교 이름 변경
- 로그인 세션은 **12시간** 뒤 자동으로 만료됩니다
- 비밀번호를 바꾸려면 Vercel 환경변수 `ADMIN_PASSWORD`를 수정하고 재배포하세요

---

## 7. 폴더 구조

```
src/
├─ app/
│  ├─ (site)/
│  │  ├─ page.tsx             # 건의 작성 화면 (홈)
│  │  ├─ actions.ts           # 건의 저장 서버 액션 (작성자 정보 저장 안 함)
│  │  └─ setup-check/         # 설정 점검
│  ├─ admin/
│  │  ├─ page.tsx             # 받은 건의 목록
│  │  ├─ settings/            # 학급 이름
│  │  └─ actions.ts           # 관리자 액션 (각각 로그인 재확인)
│  ├─ error.tsx               # 오류 화면
│  └─ robots.ts               # /admin 검색엔진 수집 차단
├─ components/
└─ lib/
   ├─ auth.ts                 # 비밀번호 검증 + 서명된 세션 쿠키
   ├─ supabase.ts             # anon / service_role 클라이언트
   ├─ data.ts                 # 학급 이름 조회
   └─ adminData.ts            # 건의 목록 조회 (관리자 전용)
supabase/
├─ schema.sql                 # 표 2개 + RLS
└─ cleanup-unused.sql         # (선택) 예전 표 정리
```

---

## 8. 보안 메모

- 관리자 인증은 서버에서만 확인합니다. 관리자 레이아웃과 **모든 서버 액션이 각각
  세션을 다시 검사**하므로, 주소를 직접 입력하거나 요청을 위조해도 통과하지 못합니다.
- 로그인 쿠키는 `httpOnly` + `SameSite=Lax` + 서명(HMAC-SHA256) + 12시간 만료입니다.
- 공개 화면은 `anon` 키만 사용하고, `service_role` 키는 서버 코드에서만 참조합니다.
