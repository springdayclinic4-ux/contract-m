# ⚡ AWS 빠른 시작 (5분 가이드)

가장 쉬운 AWS 배포 방법

---

## 🎯 추천: AWS Lightsail (올인원)

**가장 간단하고 저렴한 방법** - 월 $25

---

## 📋 준비물

- [ ] AWS 계정 (신용카드 필요)
- [ ] GitHub에 업로드된 코드
- [ ] 10분의 시간

---

## 🚀 5단계로 배포하기

### 1단계: AWS 계정 만들기 (3분)

1. https://aws.amazon.com/ko/ 접속
2. "무료 계정 만들기"
3. 이메일, 신용카드 등록
4. 전화번호 인증

---

### 2단계: 데이터베이스 만들기 (2분)

1. AWS Console 로그인
2. 검색창에 **"Lightsail"** 입력
3. **"데이터베이스"** 탭 → **"데이터베이스 생성"**
4. 설정:
   - PostgreSQL 선택
   - 플랜: **$15/월** (Standard)
   - 데이터베이스 이름: `theranova`
   - 마스터 사용자: `postgres`
   - 암호: 강력한 비밀번호 입력 **(꼭 기억하세요!)**
5. **"생성"** 클릭
6. 생성 후 **"엔드포인트"** 복사

```
ls-xxxxxxxxxxxxx.xxxxxxxx.ap-northeast-2.rds.amazonaws.com
```

---

### 3단계: 서버 만들기 (2분)

1. Lightsail → **"인스턴스"** 탭 → **"인스턴스 생성"**
2. 설정:
   - 리전: **서울 (ap-northeast-2)**
   - 플랫폼: **Linux/Unix**
   - 블루프린트: **Node.js**
   - 플랜: **$10/월** (2GB RAM)
   - 인스턴스 이름: `theranova-server`
3. **"인스턴스 생성"** 클릭
4. 2-3분 대기 (생성 중)

---

### 4단계: 코드 배포 (3분)

#### 4-1. SSH 연결
1. 생성된 인스턴스 클릭
2. **"SSH를 사용하여 연결"** 클릭 (브라우저에서 터미널 열림)

#### 4-2. 코드 다운로드
```bash
# 프로젝트 디렉토리로 이동
cd /opt/bitnami/projects

# GitHub에서 코드 다운로드 (본인의 저장소 URL로 변경)
git clone https://github.com/your-username/theranova.git
cd theranova
```

#### 4-3. 백엔드 설치
```bash
cd backend
npm install

# 환경 변수 파일 생성
nano .env
```

다음 내용 입력 (↓↓↓ 복사해서 붙여넣기):
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:your-password@your-db-endpoint:5432/postgres
JWT_SECRET=change-this-to-random-32-characters-minimum
JWT_REFRESH_SECRET=another-random-32-characters-minimum
MOCK_EMAIL=true
ALLOWED_ORIGINS=*
```

**중요**: 
- `your-password`: 2단계에서 설정한 DB 비밀번호
- `your-db-endpoint`: 2단계에서 복사한 엔드포인트
- JWT 시크릿: 랜덤 문자열로 변경 (아래 명령어로 생성 가능)

JWT 시크릿 자동 생성:
```bash
# Ctrl+X로 nano 종료 후
openssl rand -base64 32  # 첫 번째 시크릿
openssl rand -base64 32  # 두 번째 시크릿
# 생성된 값을 .env 파일에 복사
nano .env
```

저장: `Ctrl + X` → `Y` → `Enter`

#### 4-4. 데이터베이스 설정
```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 테이블 생성
npx prisma migrate deploy
```

#### 4-5. 백엔드 시작
```bash
# PM2 설치 (프로세스 관리 도구)
sudo npm install -g pm2

# 백엔드 시작
pm2 start src/server.js --name theranova-backend

# 서버 재시작 시 자동 실행
pm2 startup
pm2 save
```

#### 4-6. 프론트엔드 설치
```bash
cd ../frontend
npm install

# 환경 변수 (백엔드 IP 확인 필요)
echo "VITE_API_URL=http://$(curl -s ifconfig.me):3001/api" > .env

# 빌드
npm run build
```

#### 4-7. Nginx 설치 및 설정
```bash
# Nginx 설치
sudo apt update
sudo apt install nginx -y

# Nginx 설정
sudo nano /etc/nginx/sites-available/theranova
```

다음 내용 붙여넣기:
```nginx
server {
    listen 80;
    server_name _;

    location / {
        root /opt/bitnami/projects/theranova/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

저장 후:
```bash
# 설정 활성화
sudo ln -s /etc/nginx/sites-available/theranova /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Nginx 재시작
sudo systemctl restart nginx
```

---

### 5단계: 방화벽 설정 (1분)

1. Lightsail 인스턴스 → **"네트워킹"** 탭
2. **방화벽 규칙 추가**:
   - **HTTP** (포트 80)
   - **HTTPS** (포트 443)
   - **Custom TCP** (포트 3001)
3. **"저장"** 클릭

---

## 🎉 완료!

### 접속 확인

1. Lightsail 인스턴스 페이지에서 **"퍼블릭 IP"** 복사
2. 브라우저에서 접속: `http://your-public-ip`

```
예시: http://3.37.123.45
```

---

## 📱 테스트하기

1. 회원가입 (병원 계정)
2. 로그인
3. 일용직 계약서 작성
4. 저장 테스트

---

## 🔧 유용한 명령어

### 백엔드 관리
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

### 업데이트하기
```bash
cd /opt/bitnami/projects/theranova
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
sudo systemctl reload nginx
```

### 자동 배포 스크립트
```bash
# 스크립트 다운로드
cd /opt/bitnami/projects/theranova
wget https://raw.githubusercontent.com/your-repo/deploy-lightsail.sh
chmod +x deploy-lightsail.sh

# 실행
./deploy-lightsail.sh
```

---

## 💰 비용

### 월 예상 비용
- 데이터베이스 (Standard): **$15/월**
- 서버 (2GB RAM): **$10/월**
- **총: $25/월**

### 무료 체험
- 첫 달 일부 무료 크레딧 제공
- 3개월 무료 체험 가능

---

## 🆘 문제 해결

### 백엔드가 시작되지 않음
```bash
# 로그 확인
pm2 logs theranova-backend

# 환경 변수 확인
cat /opt/bitnami/projects/theranova/backend/.env

# 데이터베이스 연결 테스트
cd /opt/bitnami/projects/theranova/backend
npm run db:studio
```

### 프론트엔드가 표시되지 않음
```bash
# Nginx 상태 확인
sudo systemctl status nginx

# Nginx 에러 로그
sudo tail -f /var/log/nginx/error.log

# 빌드 파일 확인
ls -la /opt/bitnami/projects/theranova/frontend/dist
```

### 데이터베이스 연결 실패
1. Lightsail → 데이터베이스 → "연결" 탭
2. "퍼블릭 모드" 활성화
3. 엔드포인트 재확인
4. 비밀번호 재확인

---

## 🚀 다음 단계

### 도메인 연결 (선택)
1. Route 53에서 도메인 구매
2. Lightsail → "네트워킹" → "DNS 영역 생성"
3. A 레코드 추가 → 퍼블릭 IP 입력

### SSL 인증서 (HTTPS)
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급 (도메인 연결 후)
sudo certbot --nginx -d your-domain.com

# 자동 갱신
sudo certbot renew --dry-run
```

### 실제 이메일 발송
1. AWS SES 설정
2. 도메인 인증
3. 발송 한도 증가 요청
4. `.env`에서 `MOCK_EMAIL=false`로 변경

---

## 📞 도움 받기

- **AWS Lightsail 문서**: https://lightsail.aws.amazon.com/ls/docs
- **AWS 지원**: https://aws.amazon.com/ko/support/
- **커뮤니티 포럼**: https://forums.aws.amazon.com/

---

## ✅ 체크리스트

- [ ] AWS 계정 생성
- [ ] 데이터베이스 생성
- [ ] 서버 생성
- [ ] 코드 배포
- [ ] 방화벽 설정
- [ ] 브라우저 접속 테스트
- [ ] 회원가입 테스트
- [ ] 계약서 작성 테스트

---

**축하합니다! AWS에 성공적으로 배포했습니다! 🎉**
