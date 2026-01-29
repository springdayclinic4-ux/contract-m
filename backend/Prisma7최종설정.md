# Prisma 7.* 최종 설정 가이드

## Prisma 7의 설정 방식

Prisma 7에서는:
- **schema.prisma**: `datasource`에 `url` 포함 (migrate 명령어용)
- **PrismaClient 생성**: `datasourceUrl` 옵션으로 전달 (런타임용)

이 두 가지를 모두 설정해야 합니다.

## 현재 설정

### schema.prisma
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // migrate 명령어용
}
```

### database.js
```javascript
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,  // 런타임용
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

## 다음 단계

이제 다음 명령어들이 정상 작동합니다:

1. **Prisma 클라이언트 생성**
   ```bash
   npm run db:generate
   ```

2. **데이터베이스 마이그레이션**
   ```bash
   npm run db:migrate
   ```

3. **서버 실행**
   ```bash
   npm run dev
   ```
