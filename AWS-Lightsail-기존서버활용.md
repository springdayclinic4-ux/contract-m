# 🔧 AWS Lightsail 기존 서버에 THERANOVA 배포

기존 LAMP 서버에 Node.js 앱을 추가로 배포하는 가이드

---

## ⚠️ 주의사항

현재 서버 정보:
- **이름**: FACEFILTER
- **스택**: LAMP (PHP 8) - Bitnami
- **IP**: 3.35.2.125
- **기존 사용**: 다른 서비스 실행 중

---

## 🎯 배포 전략

### 포트 구성
- **기존 PHP 앱**: 포트 80 (Apache)
- **THERANOVA 백엔드**: 포트 3001
- **THERANOVA 프론트엔드**: 포트 3000 또는 80의 서브패스

### 도메인/경로 구성 옵션

#### 옵션 1: 서브도메인 사용 (추천)
```
http://3.35.2.125           → 기존 PHP 앱
http://app.3.35.2.125       → THERANOVA 프론트엔드
http://api.3.35.2.125/api   → THERANOVA 백엔드
```

#### 옵션 2: 경로 기반
```
http://3.35.2.125           → 기존 PHP 앱
http://3.35.2.125/theranova → THERANOVA 프론트엔드
http://3.35.2.125/api       → THERANOVA 백엔드
```

---

## 📋 단계별 가이드

### 1단계: SSH 연결

1. Lightsail 콘솔 → FACEFILTER 인스턴스 클릭
2. "SSH를 사용하여 연결" 클릭

---

### 2단계: Node.js 설치

```bash
# 시스템 업데이트
sudo apt update

# Node.js 20.x 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# 설치 확인
node --version  # v20.x.x
npm --version   # 10.x.x

# PM2 설치 (프로세스 관리)
sudo npm install -g pm2

# Git 설치 (이미 있을 수 있음)
sudo apt install git -y
```

---

### 3단계: PostgreSQL 클라이언트 설치

```bash
# PostgreSQL 클라이언트 도구
sudo apt install postgresql-client -y
```

---

### 4단계: 프로젝트 다운로드

```bash
# 프로젝트 디렉토리 생성
sudo mkdir -p /opt/theranova
sudo chown -R bitnami:bitnami /opt/theranova

# 코드 클론 (본인의 저장소 URL로 변경)
cd /opt/theranova
git clone https://github.com/your-username/theranova.git .
```

---

### 5단계: 데이터베이스 설정

#### 5-1. Lightsail 데이터베이스 생성
1. Lightsail 콘솔 → "데이터베이스" 탭
2. "데이터베이스 생성"
3. PostgreSQL, Standard ($15/월)
4. 데이터베이스 이름: `theranova`
5. 마스터 사용자: `postgres`
6. 암호 설정 (기억하세요!)

#### 5-2. 엔드포인트 확인
생성 후 "엔드포인트" 복사:
```
ls-xxxxxxxxxxxxx.xxxxxxxx.ap-northeast-2.rds.amazonaws.com
```

---

### 6단계: 백엔드 설정

```bash
cd /opt/theranova/backend

# 의존성 설치
npm install

# 환경 변수 설정
nano .env
```

환경 변수 내용:
```env
NODE_ENV=production
PORT=3001

# 데이터베이스 (Lightsail DB 엔드포인트 사용)
DATABASE_URL=postgresql://postgres:your-password@your-db-endpoint:5432/postgres

# JWT 시크릿 (랜덤 생성)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-also-32-characters

# 이메일 (개발용)
MOCK_EMAIL=true

# CORS (나중에 프론트엔드 URL로 변경)
ALLOWED_ORIGINS=*
```

JWT 시크릿 생성:
```bash
# Ctrl+X로 nano 종료 후
openssl rand -base64 32  # 첫 번째
openssl rand -base64 32  # 두 번째
# 생성된 값을 .env에 복사
nano .env
```

저장: `Ctrl + X` → `Y` → `Enter`

---

### 7단계: Prisma 설정

```bash
cd /opt/theranova/backend

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate deploy

# 확인
npx prisma db pull
```

---

### 8단계: 백엔드 시작

```bash
cd /opt/theranova/backend

# PM2로 시작
pm2 start src/server.js --name theranova-backend

# 자동 시작 설정
pm2 startup
pm2 save

# 상태 확인
pm2 status
pm2 logs theranova-backend
```

---

### 9단계: 프론트엔드 빌드

```bash
cd /opt/theranova/frontend

# 의존성 설치
npm install

# 환경 변수 설정
echo "VITE_API_URL=http://3.35.2.125:3001/api" > .env

# 빌드
npm run build

# 빌드 결과 확인
ls -la dist/
```

---

### 10단계: Apache 설정 (Bitnami)

Bitnami LAMP에서는 Apache를 사용하므로 Apache 설정을 수정합니다.

```bash
# Apache 설정 파일 생성
sudo nano /opt/bitnami/apache2/conf/vhosts/theranova.conf
```

다음 내용 입력:

#### 옵션 A: 경로 기반 (/theranova, /api)
```apache
# THERANOVA API 프록시
<Location /api>
    ProxyPass http://localhost:3001/api
    ProxyPassReverse http://localhost:3001/api
    ProxyPreserveHost On
</Location>

# THERANOVA 프론트엔드
Alias /theranova /opt/theranova/frontend/dist
<Directory /opt/theranova/frontend/dist>
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted
    
    # React Router 지원
    RewriteEngine On
    RewriteBase /theranova
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /theranova/index.html [L]
</Directory>
```

#### 옵션 B: 포트 기반 (별도 포트)
```apache
# THERANOVA 프론트엔드를 포트 3000에서 서빙
Listen 3000

<VirtualHost *:3000>
    DocumentRoot /opt/theranova/frontend/dist
    
    <Directory /opt/theranova/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>

# API 프록시
<Location /api>
    ProxyPass http://localhost:3001/api
    ProxyPassReverse http://localhost:3001/api
</Location>
```

저장 후:

```bash
# Apache 모듈 활성화
sudo /opt/bitnami/apache2/bin/apachectl -t  # 설정 테스트
sudo /opt/bitnami/ctlscript.sh restart apache  # Apache 재시작

# 오류 확인
sudo tail -f /opt/bitnami/apache2/logs/error_log
```

---

### 11단계: 방화벽 설정

1. Lightsail 콘솔 → FACEFILTER → "네트워킹" 탭
2. 방화벽 규칙 확인/추가:
   - **HTTP** (포트 80) - 이미 있을 것
   - **HTTPS** (포트 443)
   - **Custom** (포트 3000) - 옵션 B 사용 시
   - **Custom** (포트 3001) - 백엔드 직접 접근 시

---

### 12단계: 프론트엔드 환경 변수 업데이트

경로 기반(옵션 A) 사용 시:
```bash
cd /opt/theranova/frontend

# 환경 변수 수정
echo "VITE_API_URL=http://3.35.2.125/api" > .env

# 재빌드
npm run build

# Apache 재시작
sudo /opt/bitnami/ctlscript.sh restart apache
```

---

## 🧪 테스트

### 백엔드 API 테스트
```bash
# Health check
curl http://localhost:3001/api/health

# 또는
curl http://3.35.2.125:3001/api/health
```

### 프론트엔드 접속

#### 옵션 A (경로 기반)
```
기존 앱: http://3.35.2.125/
THERANOVA: http://3.35.2.125/theranova
API: http://3.35.2.125/api
```

#### 옵션 B (포트 기반)
```
기존 앱: http://3.35.2.125/
THERANOVA: http://3.35.2.125:3000
API: http://3.35.2.125/api
```

---

## 🔧 유용한 명령어

### PM2 관리
```bash
# 상태 확인
pm2 status

# 로그 확인
pm2 logs theranova-backend

# 재시작
pm2 restart theranova-backend

# 중지
pm2 stop theranova-backend
```

### Apache 관리
```bash
# 상태 확인
sudo /opt/bitnami/ctlscript.sh status

# Apache 재시작
sudo /opt/bitnami/ctlscript.sh restart apache

# 에러 로그
sudo tail -f /opt/bitnami/apache2/logs/error_log

# 액세스 로그
sudo tail -f /opt/bitnami/apache2/logs/access_log
```

### 업데이트
```bash
cd /opt/theranova
git pull origin main

# 백엔드
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
pm2 restart theranova-backend

# 프론트엔드
cd ../frontend
npm install
npm run build
sudo /opt/bitnami/ctlscript.sh restart apache
```

---

## 🆘 문제 해결

### 포트 충돌
```bash
# 포트 사용 확인
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :80

# 프로세스 종료
sudo kill -9 PID
```

### Apache 설정 오류
```bash
# 설정 테스트
sudo /opt/bitnami/apache2/bin/apachectl -t

# 설정 파일 확인
sudo nano /opt/bitnami/apache2/conf/vhosts/theranova.conf
```

### 권한 문제
```bash
# 디렉토리 권한 설정
sudo chown -R bitnami:daemon /opt/theranova/frontend/dist
sudo chmod -R 755 /opt/theranova/frontend/dist
```

### 데이터베이스 연결 실패
```bash
# 연결 테스트
cd /opt/theranova/backend
npx prisma db pull

# 환경 변수 확인
cat .env | grep DATABASE_URL
```

---

## 💰 추가 비용

기존 서버 사용:
- **인스턴스**: $0 (이미 지불 중)
- **데이터베이스**: $15/월
- **총**: **$15/월**

---

## ⚠️ 주의사항

### 리소스 공유
- 기존 PHP 앱과 리소스(CPU, 메모리) 공유
- 트래픽 많으면 성능 저하 가능
- 모니터링 필요

### 백업
```bash
# 기존 설정 백업
sudo cp /opt/bitnami/apache2/conf/httpd.conf /opt/bitnami/apache2/conf/httpd.conf.backup
sudo cp -r /opt/bitnami/apache2/conf/vhosts /opt/bitnami/apache2/conf/vhosts.backup
```

### 롤백
```bash
# THERANOVA 제거
pm2 delete theranova-backend
sudo rm -rf /opt/theranova
sudo rm /opt/bitnami/apache2/conf/vhosts/theranova.conf
sudo /opt/bitnami/ctlscript.sh restart apache
```

---

## 📊 모니터링

### 리소스 사용량 확인
```bash
# CPU/메모리
htop

# 디스크
df -h

# 네트워크
sudo netstat -tulpn
```

### PM2 모니터링
```bash
pm2 monit
```

---

## ✅ 체크리스트

- [ ] Node.js 설치
- [ ] PostgreSQL 클라이언트 설치
- [ ] 데이터베이스 생성
- [ ] 코드 클론
- [ ] 백엔드 환경 변수 설정
- [ ] Prisma 마이그레이션
- [ ] PM2로 백엔드 시작
- [ ] 프론트엔드 빌드
- [ ] Apache 설정
- [ ] 방화벽 규칙
- [ ] 테스트
- [ ] 모니터링 설정

---

**배포 성공을 기원합니다! 🚀**
