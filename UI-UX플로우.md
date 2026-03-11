# HOS 계약서 관리 시스템 - UI/UX 플로우

**마지막 업데이트:** 2026-03-08
**현재 상태:** 전체 구현 완료 + 운영 배포

---

## 시스템 아키텍처

```
[브라우저] → [Nginx (프록시)] → [Fastify 백엔드 :3000]
                ↓                         ↓
         [프론트엔드 정적파일]      [PostgreSQL DB]
         (React + Vite)            (Prisma ORM)
```

- 프론트엔드: React 18 + TypeScript + Tailwind CSS + Vite
- 백엔드: Fastify 4 + Prisma 5 + PostgreSQL
- 배포: AWS Lightsail + Nginx + PM2

---

## 사용자 유형

| 유형 | 설명 | 주요 기능 |
|------|------|----------|
| 병원 (hospital) | 계약서를 작성하고 발송하는 주체 | 계약서 생성/발송/서명(갑)/관리 |
| 의사 (doctor) | 일용직 계약서에 서명하는 대상 | 대기 계약서 확인/서명/거부/개인정보삭제 |
| 직원 (employee) | 근로계약서에 서명하는 대상 | 대기 계약서 확인/서명/거부 |
| 관리자 (admin) | 시스템 전체 관리 | 전체 통계 조회 |

---

## 페이지 구성 (15개)

### 인증 관련 (4개)

| 페이지 | 경로 | 설명 |
|--------|------|------|
| LoginPage | `/login` | 사용자 유형 탭(병원/의사/직원) + 이메일/비밀번호 입력 |
| RegisterPage | `/register` | 유형별 회원가입 폼 + 이메일 인증 코드 |
| ForgotPasswordPage | `/forgot-password` | 이메일 인증 → 비밀번호 재설정 |
| AdminLoginPage | `/admin/login` | 관리자 전용 토큰 로그인 |

### 메인 (2개)

| 페이지 | 경로 | 설명 |
|--------|------|------|
| DashboardPage | `/dashboard` | 병원: 계약서 현황 + 빠른 작성 / 의사: 대기 계약서 목록 |
| AdminDashboardPage | `/admin/dashboard` | 전체 시스템 통계 (마스터 전용) |

### 계약서 관리 (5개)

| 페이지 | 경로 | 설명 |
|--------|------|------|
| DailyContractPage | `/contracts/daily/new` | 일용직(대진) 계약서 작성 폼 |
| RegularContractPage | `/contracts/regular/new` | 일반 근로계약서 작성 폼 |
| ContractsListPage | `/contracts` | 계약서 목록 (일용직+근로 통합) |
| ContractDetailPage | `/contracts/:id` | 계약서 상세 + 병원서명 + 인쇄 + 다시보내기 |
| ContractInvitationPage | `/contracts/invitation/:token` | 의사/직원 서명 페이지 (이메일 링크) |

### 기타 (4개)

| 페이지 | 경로 | 설명 |
|--------|------|------|
| StatisticsPage | `/statistics` | 계약 통계 (상태별 분류, 차트) |
| SettingsPage | `/settings` | 프로필 수정, 비밀번호 변경 |
| ComingSoonPage | `/coming-soon` | 미구현 기능 안내 |
| PlaceholderPage | - | 빈 페이지 placeholder |

---

## 상세 사용자 흐름

### 1. 병원 사용자 흐름

```
[회원가입]
  이메일 입력 → 인증코드 발송 → 코드 입력 → 병원 정보 입력
  (사업자등록번호, 병원명, 대표자명, 주소, 전화, 담당자) → 이용약관 동의 → 가입 완료

[로그인]
  이메일 + 비밀번호 → JWT 토큰 발급 → 대시보드 이동

[대시보드]
  ├── 계약서 현황 요약 카드
  ├── 빠른 작성 바로가기
  │   ├── 일용직 계약서 작성
  │   └── 근로계약서 작성
  ├── 계약서 목록 바로가기
  └── 통계 바로가기

[일용직 계약서 작성]
  ① 의사 정보 입력
     - 이메일(필수), 성명(필수), 주민번호, 면허번호(필수)
     - 주소(필수), 연락처, 은행명, 계좌번호
  ② 근무 조건 입력
     - 근무일(달력 복수선택, 필수), 근무시간, 휴게시간
  ③ 급여 설정
     - 세전/세후 선택 → 금액 직접 입력(필수)
     - 과세 방식: 프리랜서(3.3%) / 일용직(근로소득세)
     - 지급일: 당일/익일/매주/매월(10/15/25/말일)
  ④ 부속서류 선택
     - 개인정보 동의서 (항상 포함)
     - 보안 서약서 (선택, 기본 체크)
     - 급여 명세서 (선택, 기본 미체크)
     - 성범죄 조회 동의서 (선택, 기본 미체크)
  ⑤ 특약사항 입력 (선택)
  ⑥ 미리보기 (최종 계약서와 동일 템플릿)
  ⑦ 저장 → draft 상태로 생성

[계약서 발송]
  계약서 상세 페이지 → "발송하기" 클릭
  → 초대 토큰 생성 → 이메일 발송 (병원명, 의사명, 계약번호 포함)
  → status: draft → sent

[다시보내기]
  발송됨(sent) 상태 → "다시 보내기" 클릭
  → 기존 초대 토큰 삭제 → 새 토큰 생성 → 이메일 재발송

[병원(갑) 서명]
  계약서 상세 → 서명 패드 → 캔버스에 서명 → hospitalSignatureUrl 저장
```

### 2. 의사 사용자 흐름

```
[이메일 수신]
  이메일의 "계약서 확인 및 서명하기" 버튼 클릭
  → /contracts/invitation/:token 페이지 이동

[미로그인 시]
  계약서 내용 열람 가능 (서명 불가)
  → 인라인 로그인 폼 표시 or 회원가입 링크
  → 로그인 성공 → 대시보드로 이동

[로그인 후 대시보드]
  대기중 계약서 목록 표시
  → "계약서 확인" 클릭 → /contracts/invitation/:token?from=dashboard

[서명 플로우]
  ① 계약서 전문 확인 (CompleteDailyContractTemplate)
     - 근로계약서 본문
     - 개인정보 동의서
     - 보안 서약서 (선택된 경우)
     - 급여 명세서 (선택된 경우)
     - 성범죄 조회 동의서 (선택된 경우)
  ② 이메일 일치 검증 (로그인 이메일 = 초대 이메일)
  ③ "서명하기" → 캔버스 서명 → 서명 완료
     OR "거부하기" → 거부 사유 입력 → 거부 처리

[서명/거부 후]
  "개인정보 삭제하기" 버튼 표시
  → 클릭 시 confirm → 서버에서 완전 삭제
  → 삭제 항목: 주민번호, 계좌번호, 은행명, 연락처
  → 삭제 완료 모달 표시

[인쇄]
  로그인 상태에서 "인쇄하기" 버튼 → 브라우저 인쇄 다이얼로그
```

### 3. 직원 사용자 흐름

```
의사 흐름과 동일한 구조
- 근로계약서(regular) 서명
- LaborContractInvitation 토큰 사용
```

---

## 계약서 상태 흐름

```
[draft] → 발송하기 → [sent] → 의사 서명 → [signed]
  초안         ↑         발송됨        ↘        서명완료
               │                      [rejected]
               │                        거부됨
               └── 다시보내기 ──┘
                (sent → sent, 토큰 갱신)
```

| 상태 | 의미 | 가능한 액션 |
|------|------|------------|
| draft | 초안 (미발송) | 발송, 수정, 삭제 |
| sent | 발송됨 (서명 대기) | 다시보내기, 병원서명 |
| signed | 서명 완료 | 인쇄, 개인정보삭제 |
| rejected | 거부됨 | 개인정보삭제 |

---

## 컴포넌트 구조

### 계약서 템플릿 (통합)

```
CompleteDailyContractTemplate (통합 템플릿)
├── Page 1: 근로계약서 본문 (제1조~제7조)
│   └── 서명란: 갑(병원) + 을(의사) — 서명 이미지 표시
├── Page 2: 개인정보 수집·이용·제공 동의서
├── Page 3: 보안 서약서 (선택)
├── Page 4: 급여 명세서 (선택) — 세금 자동 계산
└── Page 5: 성범죄 조회 동의서 (선택)
```

**사용 위치:**
- `DailyContractPage.tsx` → 미리보기
- `ContractDetailPage.tsx` → 병원 측 상세 보기
- `ContractInvitationPage.tsx` → 의사 측 서명 페이지

**Props (snake_case):**
```typescript
{
  hospital_name, director_name, hospital_address,
  doctor_name, doctor_registration_number, doctor_phone,
  doctor_license_number, doctor_address,
  bank_name, account_number,
  workDates: string[], start_time, end_time, break_time,
  wage_gross, wage_net, wage_type: 'gross' | 'net',
  tax_method: 'business' | 'daily',
  payment_date?: string,
  special_conditions,
  include_security_pledge, include_pay_stub, include_crime_check,
  signature_image_url?, hospital_signature_url?
}
```

### 회원가입 폼

```
RegisterPage
├── RegisterHospitalForm — 병원 회원가입
├── RegisterDoctorForm — 의사 회원가입
└── RegisterEmployeeForm — 직원 회원가입
```

### 공통 컴포넌트

```
EmailVerification — 이메일 인증 코드 입력 UI
TermsModal — 이용약관/개인정보처리방침 모달
RegularContractTemplate — 근로계약서 템플릿
DailyContractTemplate — (레거시, CompleteDailyContractTemplate으로 대체됨)
```

---

## API 엔드포인트 목록

### 인증 (`/api/auth`)

| Method | 경로 | 설명 | Rate Limit |
|--------|------|------|-----------|
| POST | `/send-verification` | 인증코드 발송 | 3/분 |
| POST | `/verify-email` | 인증코드 확인 | - |
| POST | `/register/hospital` | 병원 가입 | - |
| POST | `/register/doctor` | 의사 가입 | - |
| POST | `/register/employee` | 직원 가입 | - |
| POST | `/login` | 로그인 | 5/분 |
| POST | `/admin-login` | 관리자 로그인 | 5/분 |
| POST | `/forgot-password` | 비밀번호 찾기 | 3/분 |
| POST | `/reset-password` | 비밀번호 재설정 | - |
| POST | `/logout` | 로그아웃 | - |

### 계약서 (`/api/contracts`)

| Method | 경로 | 설명 |
|--------|------|------|
| POST | `/daily` | 일용직 계약서 생성 |
| POST | `/regular` | 근로계약서 생성 |
| GET | `/my-pending` | 내 대기 계약서 (의사용) |
| GET | `/` | 계약서 목록 |
| GET | `/:id` | 계약서 상세 |
| POST | `/:id/send` | 발송 (초회/재발송) |
| POST | `/:id/hospital-sign` | 병원 서명 |
| GET | `/invitation/:token` | 초대 계약서 조회 |
| POST | `/invitation/:token/sign` | 의사 서명 |
| POST | `/invitation/:token/reject` | 거부 |
| POST | `/invitation/:token/delete-personal-info` | 개인정보 삭제 |
| DELETE | `/:id` | 계약서 삭제 |

### 사용자 (`/api/users`)

| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/me` | 내 정보 조회 |
| PUT | `/me` | 내 정보 수정 |
| PUT | `/me/password` | 비밀번호 변경 |

### 통계 (`/api/statistics`)

| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/` | 전체 통계 (관리자) |
| GET | `/my` | 내 통계 |

---

## 라우팅 구조 (App.tsx)

```
/ → RootRedirect (로그인 여부에 따라 /dashboard 또는 /login)
/login → LoginPage
/register → RegisterPage
/forgot-password → ForgotPasswordPage
/dashboard → DashboardPage
/contracts → ContractsListPage
/contracts/daily/new → DailyContractPage
/contracts/regular/new → RegularContractPage
/contracts/:id → ContractDetailPage
/contracts/invitation/:token → ContractInvitationPage
/statistics → StatisticsPage
/settings → SettingsPage
/admin/login → AdminLoginPage
/admin/dashboard → AdminDashboardPage
```

---

## 이메일 템플릿

### 계약서 초대 이메일
- **제목:** `[HOS] OO병원 - 의사 일용직 근로계약서 서명 요청`
- **내용:** 수신자명, 병원명, 계약번호 표시
- **CTA 버튼:** "계약서 확인 및 서명하기" → `/contracts/invitation/:token`
- **유효기간:** 7일

### 인증코드 이메일
- **제목:** `[HOS] 이메일 인증 코드`
- **내용:** 6자리 인증코드, 10분 유효

### 비밀번호 재설정 이메일
- **제목:** `[HOS] 비밀번호 재설정 코드`
- **내용:** 6자리 인증코드, 10분 유효
