# Prisma 7.* 설정 가이드

## Prisma 7의 주요 변경사항

1. **datasource의 `url` 제거**: `schema.prisma`에서 `url` 속성을 제거해야 합니다.
2. **prisma.config.ts 파일 사용**: 데이터베이스 URL은 `prisma/config.ts` 파일에 정의합니다.
3. **PrismaClient 생성 시 `datasourceUrl` 전달**: 데이터베이스 URL을 PrismaClient 생성자에 직접 전달합니다.

## 현재 설정

### schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  // url은 제거됨 (Prisma 7)
}
```

### prisma/config.ts
```typescript
import { defineDatasource } from '@prisma/client';

export default defineDatasource({
  provider: 'postgresql',
  url: process.env.DATABASE_URL,
});
```

### database.js
```javascript
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,  // 여기서 전달
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

## 다음 단계

1. **데이터베이스 생성** (아직 안 했다면)
   - pgAdmin 사용 또는
   - `데이터베이스생성.bat` 실행 또는
   - Prisma Migrate로 자동 생성

2. **Prisma 클라이언트 생성**
   ```bash
   npm run db:generate
   ```

3. **데이터베이스 마이그레이션**
   ```bash
   npm run db:migrate
   ```

4. **서버 실행**
   ```bash
   npm run dev
   ```
