# HOS Contract Management — Backend

Fastify 4 + Prisma 5 + PostgreSQL + Zod

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일 생성:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/hos_contracts"
JWT_SECRET="your-secret-key-at-least-32-characters-long"
FRONTEND_URL=http://localhost:3001
MOCK_EMAIL=true
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### 3. 데이터베이스 설정

```bash
npx prisma generate
npx prisma migrate deploy
```

### 4. 서버 실행

```bash
npm run dev     # 개발 (--watch)
npm start       # 프로덕션
```

서버: http://localhost:3000

---

## 프로젝트 구조

```
backend/
├── prisma/
│   ├── schema.prisma              # DB 스키마 (9개 모델)
│   └── migrations/                # 마이그레이션 파일 (5개)
├── src/
│   ├── server.js                  # Fastify 서버 진입점
│   ├── config/
│   │   └── database.js            # Prisma 클라이언트
│   ├── routes/
│   │   ├── auth.js                # 인증 (가입/로그인/비밀번호)
│   │   ├── contracts.js           # 계약서 CRUD + 발송 + 서명
│   │   ├── statistics.js          # 통계 조회
│   │   └── users.js               # 사용자 프로필
│   ├── utils/
│   │   ├── email.js               # 이메일 발송 (Gmail SMTP)
│   │   ├── jwt.js                 # JWT 토큰 생성/검증
│   │   └── crypto.js              # UUID 생성
│   ├── middleware/
│   │   ├── auth.js                # 인증 미들웨어
│   │   └── zodValidation.js       # Zod 요청 검증
│   └── schemas/
│       └── auth.schema.js         # 인증 스키마
├── .env
└── package.json
```

---

## 기술 스택

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
| @fastify/rate-limit | 9.x | Rate Limiting (Fastify 4 호환) |
| @fastify/helmet | - | 보안 헤더 |
| @fastify/cors | - | CORS |

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
| GET | `/my-pending` | 내 대기 계약서 (의사/직원) |
| GET | `/` | 계약서 목록 |
| GET | `/:id` | 계약서 상세 |
| POST | `/:id/send` | 발송 / 재발송 |
| POST | `/:id/hospital-sign` | 병원(갑) 서명 |
| GET | `/invitation/:token` | 초대 토큰으로 계약서 조회 |
| POST | `/invitation/:token/sign` | 의사/직원 서명 |
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

## 보안

- **JWT 시크릿**: 32자 이상 필수 (미달 시 서버 시작 거부)
- **Rate Limiting**: 글로벌 100/분, 인증 5/분, 이메일 3/분
- **Helmet**: XSS, MIME, 기타 보안 헤더
- **에러 응답**: 프로덕션에서 스택 트레이스 숨김
- **이메일 정규화**: 계약서 생성 시 doctorEmail toLowerCase 처리

---

## 개발 명령어

```bash
npm run dev          # 개발 서버 (--watch)
npm start            # 프로덕션 서버
npm run db:generate  # Prisma 클라이언트 생성
npm run db:migrate   # 마이그레이션 적용
npm run db:studio    # Prisma Studio (DB GUI)
```

---

## 마이그레이션 이력

| 마이그레이션 | 설명 |
|-------------|------|
| 20260123082223_init | 초기 스키마 전체 |
| 20260125073020_add_labor_contract | LaborContract 모델 추가 |
| 20260128_add_hospital_signature | 병원 서명 URL 컬럼 |
| 20260308200001_purge_signed_registration_numbers | 서명 완료 주민번호 정리 |
| 20260308300001_add_payment_date | 급여 지급일 컬럼 |
