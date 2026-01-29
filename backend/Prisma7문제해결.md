# Prisma 7 엔진 타입 문제 해결

## 문제

Prisma 7.2.0에서 다음 오류가 발생:
```
PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor.
```

## 해결 방법

### 방법 1: Prisma 버전 다운그레이드 (권장)

Prisma 7.0.0은 이 문제가 없을 수 있습니다:

```bash
npm install prisma@7.0.0 @prisma/client@7.0.0
npm run db:generate
```

### 방법 2: Prisma 6.x 사용

Prisma 6.x는 안정적입니다:

```bash
npm install prisma@6.20.0 @prisma/client@6.20.0
npm run db:generate
```

### 방법 3: DATABASE_URL 확인

`.env` 파일에 `DATABASE_URL`이 올바르게 설정되어 있는지 확인:

```
DATABASE_URL=postgresql://postgres:ektlqhaskf1%21@localhost:5432/hos_contracts?schema=public
```

### 방법 4: Prisma Accelerate 사용 (유료)

Prisma Accelerate를 사용하면 이 문제를 해결할 수 있지만, 유료 서비스입니다.

## 현재 설정

- Prisma 버전: 7.2.0
- `engineType`: 제거됨 (기본값 사용)
- `DATABASE_URL`: 환경 변수에서 자동 읽기

## 다음 단계

1. Prisma 버전을 7.0.0으로 다운그레이드 시도
2. 또는 Prisma 6.x로 다운그레이드
3. `.env` 파일의 `DATABASE_URL` 확인
