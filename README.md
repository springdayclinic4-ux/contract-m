# 🏥 THERANOVA 계약서 관리 시스템

병원, 의사, 직원 간의 근로계약서를 전자적으로 작성하고 관리하는 시스템입니다.

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Fastify-4.26-000000?style=for-the-badge&logo=fastify&logoColor=white" />
</p>

---

## ✨ 주요 기능

### 👥 사용자 관리
- 🏥 **병원 계정**: 계약서 작성 및 발송 (갑 역할)
- 👨‍⚕️ **의사 계정**: 받은 계약서 확인 및 전자서명 (을 역할)
- 👤 **직원 계정**: 받은 계약서 확인 및 전자서명 (을 역할)

### 📝 계약서 관리
- ✅ **일용직 근로계약서**: 의사 대진 계약서 작성 및 관리
- 🚧 **일반 근로계약서**: 직원 고용 계약서 (준비 중)
- 📧 **이메일 발송**: 계약서 초대 링크 자동 발송
- ✍️ **전자서명**: 터치 및 마우스 지원 전자서명
- 🖨️ **PDF 출력**: 계약서 PDF 저장 및 인쇄

### 🔒 보안
- 🔐 **JWT 인증**: Access Token + Refresh Token
- 📧 **이메일 인증**: 회원가입 시 이메일 인증
- 🛡️ **역할 기반 접근 제어**: 사용자 타입별 권한 관리
- 🔑 **비밀번호 암호화**: bcrypt 해싱

---

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 24.x 이상
- PostgreSQL 16 이상
- npm 또는 yarn

### 로컬 개발 환경 설정

#### 1. 저장소 클론
```bash
git clone https://github.com/your-username/theranova.git
cd theranova
```

#### 2. 백엔드 설정
```bash
cd backend
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집 (DATABASE_URL, JWT_SECRET 등)

# 데이터베이스 마이그레이션
npm run db:generate
npm run db:migrate

# 개발 서버 실행
npm run dev
```

#### 3. 프론트엔드 설정
```bash
cd frontend
npm install

# 환경 변수 설정
echo "VITE_API_URL=http://localhost:3001/api" > .env

# 개발 서버 실행
npm run dev
```

#### 4. 접속
- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:3001/api

---

## 📦 배포

### ⚡ 빠른 배포 (비개발자용)

#### 방법 1: Vercel + Render (무료)
[`빠른시작.md`](./빠른시작.md) - 5분 배포
- **프론트엔드**: Vercel (무료)
- **백엔드**: Render (무료 750시간/월)
- **데이터베이스**: Neon (무료 3GB)
- **비용**: 무료 ~ $25/월

#### 방법 2: AWS Lightsail (추천) ⭐
[`AWS-빠른시작.md`](./AWS-빠른시작.md) - 5분 배포
- **올인원**: 서버 + 데이터베이스
- **비용**: $25/월 (고정)
- **성능**: 안정적

### 📚 상세 배포 가이드
- [`배포가이드.md`](./배포가이드.md) - Vercel/Render/Railway 상세 가이드
- [`AWS배포가이드.md`](./AWS배포가이드.md) - AWS 완벽 가이드 (3가지 방법)
- [`AWS배포체크리스트.md`](./AWS배포체크리스트.md) - 배포 전후 체크리스트

---

## 🏗️ 기술 스택

### Backend
- **Runtime**: Node.js 24.x
- **Framework**: Fastify 4.x
- **Database**: PostgreSQL 16 + Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Email**: AWS SES

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite 5.x
- **Routing**: React Router v6
- **Styling**: TailwindCSS 3.x
- **HTTP Client**: Axios
- **TypeScript**: 5.3

---

## 📁 프로젝트 구조

```
theranova/
├── backend/
│   ├── src/
│   │   ├── routes/        # API 라우트
│   │   ├── utils/         # 유틸리티 함수
│   │   └── server.js      # Fastify 서버
│   ├── prisma/
│   │   └── schema.prisma  # 데이터베이스 스키마
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── lib/           # API 클라이언트
│   │   └── App.tsx
│   └── package.json
├── 배포가이드.md          # 상세 배포 가이드
├── 빠른시작.md            # 5분 배포 가이드
└── README.md
```

---

## 🔐 환경 변수

### Backend (.env)
```env
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/theranova"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-also-32-chars"

# 개발 모드
NODE_ENV=development
ALLOW_UNVERIFIED_SIGNUP=true
MOCK_EMAIL=true

# AWS SES (프로덕션)
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_SES_FROM_EMAIL=noreply@theranova.com
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 📖 API 문서

### 인증
- `POST /api/auth/send-verification` - 이메일 인증 코드 발송
- `POST /api/auth/verify-code` - 인증 코드 확인
- `POST /api/auth/register/hospital` - 병원 회원가입
- `POST /api/auth/register/doctor` - 의사 회원가입
- `POST /api/auth/register/employee` - 직원 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신

### 사용자
- `GET /api/users/me` - 내 정보 조회
- `PUT /api/users/me` - 내 정보 수정
- `PUT /api/users/me/password` - 비밀번호 변경

### 계약서
- `POST /api/contracts/daily` - 일용직 계약서 생성
- `POST /api/contracts/regular` - 일반 계약서 생성
- `GET /api/contracts` - 계약서 목록 조회
- `GET /api/contracts/:id` - 계약서 상세 조회
- `POST /api/contracts/:id/send` - 계약서 발송
- `GET /api/contracts/invitation/:token` - 초대 링크 조회
- `POST /api/contracts/invitation/:token/sign` - 계약서 서명
- `POST /api/contracts/invitation/:token/reject` - 계약서 거부

### 통계
- `GET /api/statistics` - 통계 조회 (마스터 계정만)

---

## 🧪 테스트 계정

### 병원 계정
```
이메일: hospital@test.com
비밀번호: test1234
역할: 계약서 작성 및 발송
```

### 의사 계정
```
이메일: doctor@test.com
비밀번호: test1234
역할: 계약서 수신 및 서명
```

### 직원 계정
```
이메일: employee@test.com
비밀번호: test1234
역할: 계약서 수신 및 서명
```

---

## 🛠️ 개발

### 데이터베이스 스키마 변경
```bash
cd backend
npx prisma migrate dev --name your_migration_name
npm run db:generate
```

### Prisma Studio (데이터베이스 GUI)
```bash
cd backend
npm run db:studio
```

---

## 📝 라이선스

이 프로젝트는 비공개 프로젝트입니다.

---

## 👥 기여

현재 비공개 프로젝트로, 기여는 받지 않습니다.

---

## 📞 문의

문의사항이 있으시면 이슈를 생성해주세요.

---

**Made with ❤️ by THERANOVA Team**
