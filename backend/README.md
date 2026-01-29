# HOS Contract Management Backend

Node.js 24 + Fastify + PostgreSQL + Prisma + Zod

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/hos_contracts?schema=public
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3001
```

### 3. Prisma 설정

```bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 마이그레이션
npm run db:migrate

# Prisma Studio 실행 (선택사항)
npm run db:studio
```

### 4. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## 📁 프로젝트 구조

```
backend/
├── prisma/
│   └── schema.prisma          # Prisma 스키마
├── src/
│   ├── config/
│   │   └── database.js        # Prisma 클라이언트
│   ├── routes/
│   │   └── auth.js            # 인증 라우트
│   ├── schemas/
│   │   └── auth.schema.js     # Zod validation 스키마
│   ├── middleware/
│   │   └── auth.js             # 인증 미들웨어
│   ├── utils/
│   │   ├── crypto.js           # 암호화 유틸리티
│   │   └── email.js            # 이메일 발송
│   └── server.js               # Fastify 서버
├── .env.example
└── package.json
```

## 🛠️ 기술 스택

- **Runtime**: Node.js 24
- **Framework**: Fastify
- **Database**: PostgreSQL v18
- **ORM**: Prisma 7.*
- **Validation**: Zod
- **Authentication**: JWT (@fastify/jwt)
- **Email**: AWS SES

## 📝 API 엔드포인트

### 인증

- `POST /api/auth/send-verification` - 이메일 인증 코드 발송
- `POST /api/auth/verify-email` - 이메일 인증 코드 확인
- `POST /api/auth/register/hospital` - 병원 회원가입
- `POST /api/auth/register/doctor` - 의사 회원가입
- `POST /api/auth/register/employee` - 일반직원 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃

## 🔧 개발 명령어

```bash
# Prisma 클라이언트 생성
npm run db:generate

# 마이그레이션 생성 및 적용
npm run db:migrate

# Prisma Studio 실행 (데이터베이스 GUI)
npm run db:studio

# 개발 서버 실행
npm run dev
```
