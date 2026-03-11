# HOS 계약서 관리 시스템

병원, 의사, 직원 간의 근로계약서를 전자적으로 작성, 발송, 서명, 관리하는 시스템입니다.

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Fastify-4.26-000000?style=for-the-badge&logo=fastify&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

---

## 주요 기능

### 사용자 관리
- **병원 계정** — 계약서 작성, 발송, 병원(갑) 서명, 계약서 관리
- **의사 계정** — 대기 계약서 확인, 전자서명/거부, 개인정보 삭제
- **직원 계정** — 근로계약서 확인, 전자서명/거부
- **관리자** — 전체 시스템 통계 조회

### 계약서 관리
- **일용직(대진) 계약서** — 프리랜서(3.3%) / 일용직(근로소득세) 선택, 세금 자동 계산
- **일반 근로계약서** — 정규직/계약직, 연봉/월급 체계
- **부속서류** — 개인정보 동의서, 보안 서약서, 급여명세서, 성범죄 조회 동의서
- **이메일 발송** — 계약서 초대 링크 발송 (병원명/의사명/계약번호 포함)
- **다시보내기** — 발송 상태 계약서 재발송 (기존 토큰 무효화)
- **전자서명** — 캔버스 기반 터치/마우스 서명
- **인쇄** — 브라우저 인쇄 / PDF 저장

### 급여 및 세금
- 세전(gross) / 세후(net) 선택
- 프리랜서 세금: 사업소득세 3% + 지방소득세 0.3%
- 일용직 세금: 일급 15만원 초과분 × 2.7%
- 급여 지급일 선택: 당일/익일/매주/매월(10/15/25/말일)

### 보안
- JWT 인증 (32자 이상 시크릿 필수)
- Rate Limiting (글로벌 100/분, 로그인 5/분, 이메일 3/분)
- Helmet 보안 헤더
- bcrypt 비밀번호 해싱
- 이메일 인증 (회원가입, 비밀번호 재설정)
- 서명 시 로그인 이메일 일치 검증

### 개인정보 보호
- 의사가 서명/거부 후 직접 "개인정보 삭제" 버튼으로 삭제
- 삭제 대상: 주민번호, 계좌번호, 은행명, 연락처
- 자동 삭제 없음 — 의사 클릭 전까지 데이터 유지

---

## 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18.2 | UI 프레임워크 |
| TypeScript | 5.3 | 타입 안전성 |
| Vite | 5.x | 빌드 도구 |
| Tailwind CSS | 3.x | 스타일링 |
| React Router | 6.x | 라우팅 |
| Axios | 1.6 | HTTP 클라이언트 |
| Zustand | 4.4 | 상태 관리 |
| Recharts | 3.8 | 차트 |

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Node.js | 18+ | 런타임 |
| Fastify | 4.26 | 웹 프레임워크 |
| Prisma | 5.22 | ORM |
| PostgreSQL | 16 | 데이터베이스 |
| jsonwebtoken | 9.0 | JWT 인증 |
| bcrypt | 5.1 | 비밀번호 해싱 |
| Nodemailer | 8.0 | 이메일 (Gmail SMTP) |
| Zod | 3.22 | 스키마 검증 |
| @fastify/rate-limit | 9.x | Rate Limiting |
| @fastify/helmet | - | 보안 헤더 |

### 인프라
| 기술 | 용도 |
|------|------|
| AWS Lightsail | 서버 호스팅 |
| Nginx | 리버스 프록시 |
| PM2 | 프로세스 관리 |
| Gmail SMTP | 이메일 발송 |

---

## 프로젝트 구조

```
contract-m/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # DB 스키마 (9개 모델)
│   │   └── migrations/              # 마이그레이션 파일
│   ├── src/
│   │   ├── server.js                # Fastify 서버 진입점
│   │   ├── config/database.js       # Prisma 클라이언트
│   │   ├── routes/
│   │   │   ├── auth.js              # 인증 (가입/로그인/비밀번호)
│   │   │   ├── contracts.js         # 계약서 CRUD + 발송 + 서명
│   │   │   ├── statistics.js        # 통계 조회
│   │   │   └── users.js             # 사용자 프로필
│   │   ├── utils/
│   │   │   ├── email.js             # 이메일 발송
│   │   │   ├── jwt.js               # JWT 토큰
│   │   │   └── crypto.js            # UUID 생성
│   │   └── middleware/
│   │       ├── auth.js              # 인증 미들웨어
│   │       └── zodValidation.js     # 요청 검증
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # 라우터 설정
│   │   ├── lib/api.ts               # Axios API 클라이언트
│   │   ├── pages/                   # 15개 페이지
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DailyContractPage.tsx
│   │   │   ├── RegularContractPage.tsx
│   │   │   ├── ContractsListPage.tsx
│   │   │   ├── ContractDetailPage.tsx
│   │   │   ├── ContractInvitationPage.tsx
│   │   │   ├── StatisticsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── AdminLoginPage.tsx
│   │   │   └── AdminDashboardPage.tsx
│   │   └── components/              # 공통 컴포넌트
│   │       ├── CompleteDailyContractTemplate.tsx  # 일용직 계약서 통합 템플릿
│   │       ├── RegularContractTemplate.tsx        # 근로계약서 템플릿
│   │       ├── RegisterHospitalForm.tsx
│   │       ├── RegisterDoctorForm.tsx
│   │       ├── RegisterEmployeeForm.tsx
│   │       ├── EmailVerification.tsx
│   │       └── TermsModal.tsx
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── 개발진행상황.md
├── UI-UX플로우.md
├── HOS_Data_Structure.md
└── README.md
```

---

## 로컬 개발 환경 설정

### 필수 요구사항
- Node.js 18 이상
- PostgreSQL 16 이상
- npm

### 1. 백엔드 설정

```bash
cd backend
npm install

# .env 파일 생성
cat > .env << 'EOF'
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/hos_contracts"
JWT_SECRET="your-secret-key-at-least-32-characters-long"
FRONTEND_URL=http://localhost:3001
MOCK_EMAIL=true
EOF

# DB 마이그레이션
npx prisma generate
npx prisma migrate deploy

# 서버 실행
npm run dev
```

### 2. 프론트엔드 설정

```bash
cd frontend
npm install
npm run dev
```

### 3. 접속
- 프론트엔드: http://localhost:3001
- 백엔드 API: http://localhost:3000/api
- Prisma Studio: `cd backend && npm run db:studio`

---

## 배포

### 현재 배포 환경
- **서버:** AWS Lightsail (IP: 43.203.197.122)
- **사용자:** bitnami
- **인증:** PEM 키 (LightsailDefaultKey-ap-northeast-2.pem)

### 프론트엔드 배포
```bash
cd frontend
rm -rf dist && npx vite build
scp -i "LightsailDefaultKey-ap-northeast-2.pem" -r dist/* bitnami@43.203.197.122:/home/bitnami/contract-m/frontend/dist/
```

### 백엔드 배포
```bash
scp -i "LightsailDefaultKey-ap-northeast-2.pem" -r backend/src/* bitnami@43.203.197.122:/home/bitnami/contract-m/backend/src/
ssh -i "LightsailDefaultKey-ap-northeast-2.pem" bitnami@43.203.197.122 "npx pm2 restart all"
```

### DB 마이그레이션 (필요 시)
```bash
ssh -i "LightsailDefaultKey-ap-northeast-2.pem" bitnami@43.203.197.122 "cd /home/bitnami/contract-m/backend && npx prisma migrate deploy"
```

---

## 환경 변수

### Backend (.env)
```env
# 서버
PORT=3000
NODE_ENV=production

# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/hos_contracts"

# JWT (32자 이상 필수)
JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars"

# 이메일 (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# 프론트엔드 URL (이메일 링크용)
FRONTEND_URL=https://your-domain.com

# 개발 모드 옵션
MOCK_EMAIL=false
ALLOW_UNVERIFIED_SIGNUP=false
```

---

## API 엔드포인트

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
| GET | `/my-pending` | 내 대기 계약서 (의사) |
| GET | `/` | 계약서 목록 |
| GET | `/:id` | 계약서 상세 |
| POST | `/:id/send` | 발송 / 다시보내기 |
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

## 데이터베이스 스키마

9개 Prisma 모델:

| 모델 | 테이블명 | 설명 |
|------|---------|------|
| Hospital | hospitals | 병원 계정 |
| Doctor | doctors | 의사 계정 |
| Employee | employees | 직원 계정 |
| Session | sessions | 로그인 세션 |
| Contract | contracts | 일용직 계약서 |
| LaborContract | labor_contracts | 근로계약서 |
| ContractInvitation | contract_invitations | 일용직 초대 토큰 |
| LaborContractInvitation | labor_contract_invitations | 근로 초대 토큰 |
| EmailVerification | email_verifications | 이메일 인증코드 |

상세 구조: [`HOS_Data_Structure.md`](./HOS_Data_Structure.md)

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [`개발진행상황.md`](./개발진행상황.md) | 전체 기능 구현 현황 및 변경이력 |
| [`UI-UX플로우.md`](./UI-UX플로우.md) | 페이지 구성, 사용자 흐름, API 목록 |
| [`HOS_Data_Structure.md`](./HOS_Data_Structure.md) | 데이터베이스 스키마 상세 |
| [`AWS-빠른시작.md`](./AWS-빠른시작.md) | AWS Lightsail 배포 가이드 |
| [`배포가이드.md`](./배포가이드.md) | 상세 배포 가이드 |

---

## 라이선스

비공개 프로젝트
