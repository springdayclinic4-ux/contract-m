# PostgreSQL 비밀번호 확인 방법

## 🔍 방법 1: pgAdmin에서 확인 (가장 쉬움)

### pgAdmin 사용
1. **pgAdmin 실행**
   - 시작 메뉴에서 "pgAdmin 4" 검색 후 실행
   - 또는 설치 경로에서 직접 실행

2. **서버 연결 확인**
   - 왼쪽 패널에서 "Servers" 확장
   - PostgreSQL 서버를 클릭
   - 연결 시 비밀번호를 입력하는 창이 나옵니다
   - 여기서 사용하는 비밀번호가 실제 비밀번호입니다

3. **비밀번호 저장 확인**
   - pgAdmin에서 서버를 우클릭 → "Properties"
   - "Connection" 탭에서 비밀번호 확인 (보안상 마스킹되어 있을 수 있음)

## 🔍 방법 2: Windows 자격 증명 관리자

1. **Windows 자격 증명 관리자 열기**
   - `Win + R` 키 누르기
   - `control /name Microsoft.CredentialManager` 입력 후 Enter
   - 또는: 제어판 → 자격 증명 관리자

2. **PostgreSQL 자격 증명 찾기**
   - "Windows 자격 증명" 탭 클릭
   - `postgresql` 또는 `PostgreSQL` 관련 항목 찾기
   - 항목을 클릭하여 비밀번호 확인

## 🔍 방법 3: PostgreSQL 설정 파일 확인

### pg_hba.conf 파일 확인
1. **파일 위치 찾기**
   - 일반적인 위치:
     - `C:\Program Files\PostgreSQL\18\data\pg_hba.conf`
     - `C:\Program Files\PostgreSQL\17\data\pg_hba.conf`
     - 등등...

2. **파일 열기**
   - 메모장(관리자 권한)으로 열기
   - `trust` 또는 `md5` 설정 확인

**주의**: 이 파일에는 비밀번호가 저장되어 있지 않습니다. 인증 방식만 확인할 수 있습니다.

## 🔍 방법 4: 비밀번호 재설정 (비밀번호를 모르는 경우)

### 방법 A: pgAdmin에서 재설정
1. pgAdmin 실행
2. 서버 연결 (기존 비밀번호로)
3. 서버 우클릭 → "Properties" → "Connection" 탭
4. 비밀번호 변경

### 방법 B: 명령줄에서 재설정
1. **PostgreSQL 명령줄 도구 실행**
   - 시작 메뉴에서 "SQL Shell (psql)" 검색 후 실행

2. **연결 시도**
   - 서버 이름: `localhost` (Enter)
   - 데이터베이스: `postgres` (Enter)
   - 포트: `5432` (Enter)
   - 사용자명: `postgres` (Enter)
   - 비밀번호: **여기서 비밀번호를 입력** (입력해도 화면에 표시되지 않음)

3. **비밀번호 재설정**
   ```sql
   ALTER USER postgres WITH PASSWORD '새비밀번호';
   ```

## 🔍 방법 5: 설치 시 설정한 비밀번호 확인

PostgreSQL 설치 시 설정한 비밀번호를 기억해보세요:
- 설치 중 "비밀번호 설정" 단계에서 입력한 비밀번호
- 일반적으로 `postgres` 사용자의 비밀번호

## 💡 빠른 해결책

### 비밀번호를 모르는 경우: 새로 설정하기

1. **pgAdmin 실행**
2. 서버 연결 시도
3. 비밀번호 입력 창이 나오면:
   - 일반적인 기본 비밀번호 시도: `postgres`, `admin`, `password`, `1234`
   - 또는 설치 시 설정한 비밀번호 입력

4. **연결 성공 후 비밀번호 변경**
   - 서버 우클릭 → "Properties" → "Connection"
   - 비밀번호를 원하는 값으로 변경 (예: `password123`)

5. **`.env` 파일 업데이트**
   - `backend/.env` 파일 열기
   - `DATABASE_URL`의 비밀번호를 새로 설정한 비밀번호로 변경

## 📝 체크리스트

- [ ] pgAdmin에서 서버 연결 시 사용하는 비밀번호 확인
- [ ] Windows 자격 증명 관리자에서 확인
- [ ] 설치 시 설정한 비밀번호 기억
- [ ] 비밀번호를 모르면 새로 설정

## ⚠️ 주의사항

- PostgreSQL 비밀번호는 보안상 이유로 평문으로 저장되지 않습니다
- pgAdmin에 저장된 비밀번호는 암호화되어 있습니다
- 가장 확실한 방법은 **pgAdmin에서 직접 확인**하는 것입니다
