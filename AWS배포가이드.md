# 🚀 AWS 배포 가이드 (비개발자용)

AWS에 THERANOVA 시스템을 배포하는 완벽 가이드입니다.

---

## 📋 목차
1. [AWS 계정 준비](#aws-계정-준비)
2. [방법 1: AWS Amplify (가장 쉬움)](#방법-1-aws-amplify-가장-쉬움)
3. [방법 2: AWS Lightsail (올인원)](#방법-2-aws-lightsail-올인원)
4. [방법 3: 전문가용 (EC2 + RDS)](#방법-3-전문가용-ec2--rds)

---

## AWS 계정 준비

### 1단계: AWS 회원가입
1. https://aws.amazon.com/ko/ 접속
2. "무료 계정 만들기" 클릭
3. 이메일, 비밀번호 입력
4. **신용카드 등록 필요** (무료 사용량 초과 시에만 과금)
5. 전화번호 인증

### 2단계: IAM 사용자 생성 (보안)
1. AWS Console 로그인
2. 검색창에 "IAM" 입력
3. "사용자" → "사용자 생성"
4. 사용자 이름: `theranova-admin`
5. "AWS Management Console에 대한 사용자 액세스 권한 제공" 체크
6. 권한: `AdministratorAccess` (관리자 권한)
7. 생성 후 **액세스 키 다운로드** (중요!)

---

## 방법 1: AWS Amplify (가장 쉬움) ⭐

### 장점
- GUI 중심, 코딩 불필요
- GitHub 자동 연동
- CI/CD 자동 구성
- 무료 티어 충분

### 예상 비용
- 무료: 월 1000 빌드 분, 15GB 호스팅
- 초과 시: $0.01/빌드분, $0.15/GB

---

### Part 1: 데이터베이스 (RDS)

#### 1단계: RDS PostgreSQL 생성
1. AWS Console → 검색: "RDS"
2. "데이터베이스 생성" 클릭
3. 설정:
   - **엔진**: PostgreSQL
   - **템플릿**: 프리 티어
   - **DB 인스턴스 식별자**: `theranova-db`
   - **마스터 사용자 이름**: `postgres`
   - **마스터 암호**: 강력한 비밀번호 입력 (꼭 기억!)
   - **인스턴스 클래스**: db.t3.micro (무료)
   - **스토리지**: 20GB (무료)
   - **퍼블릭 액세스**: "예" 선택 (중요!)
4. "데이터베이스 생성" 클릭 (5-10분 소요)

#### 2단계: 보안 그룹 설정
1. 생성된 DB 클릭
2. "VPC 보안 그룹" 클릭
3. "인바운드 규칙 편집"
4. 규칙 추가:
   - **유형**: PostgreSQL
   - **소스**: Anywhere-IPv4 (0.0.0.0/0)
5. "규칙 저장"

#### 3단계: 엔드포인트 확인
DB 상세 페이지에서 "엔드포인트" 복사:
```
theranova-db.xxxxxx.ap-northeast-2.rds.amazonaws.com
```

#### 4단계: 연결 문자열 생성
```
postgresql://postgres:your-password@theranova-db.xxxxxx.ap-northeast-2.rds.amazonaws.com:5432/postgres
```

---

### Part 2: 백엔드 (Elastic Beanstalk)

#### 1단계: 백엔드 코드 준비
프로젝트 루트에 `.ebextensions/nodecommand.config` 파일 생성:

```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
  aws:elasticbeanstalk:application:environment:
    NPM_USE_PRODUCTION: false
```

`backend/package.json`에 추가:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "postinstall": "npx prisma generate"
  }
}
```

#### 2단계: Elastic Beanstalk 애플리케이션 생성
1. AWS Console → "Elastic Beanstalk"
2. "애플리케이션 생성"
3. 설정:
   - **애플리케이션 이름**: `theranova-backend`
   - **플랫폼**: Node.js
   - **플랫폼 브랜치**: Node.js 18 (또는 20)
   - **코드**: "코드 업로드" 선택

#### 3단계: 백엔드 ZIP 파일 생성
```bash
# backend 폴더만 압축
cd backend
zip -r ../backend.zip . -x "node_modules/*" -x ".git/*"
cd ..
```

또는 Windows에서:
1. `backend` 폴더 내용 전체 선택
2. 마우스 우클릭 → "압축" → `backend.zip` 생성

#### 4단계: 업로드 및 배포
1. ZIP 파일 업로드
2. "환경 생성" 클릭
3. 배포 완료까지 5-10분 대기

#### 5단계: 환경 변수 설정
1. 환경 → "구성" → "소프트웨어" → "편집"
2. 환경 속성 추가:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://postgres:password@your-rds-endpoint:5432/postgres
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   JWT_REFRESH_SECRET=your-refresh-secret-also-32-characters
   MOCK_EMAIL=true
   ALLOWED_ORIGINS=*
   ```
3. "적용" 클릭 (재배포됨)

#### 6단계: 데이터베이스 마이그레이션
1. Elastic Beanstalk → "환경" → "로그" → "전체 로그 요청"
2. SSH 액세스 설정 필요 시:
   ```bash
   # EB CLI 설치
   pip install awsebcli
   
   # 환경 초기화
   eb init
   
   # SSH 연결
   eb ssh
   
   # 마이그레이션 실행
   cd /var/app/current
   npx prisma migrate deploy
   ```

#### 7단계: 백엔드 URL 확인
환경 URL 복사 (예: `theranova-backend.ap-northeast-2.elasticbeanstalk.com`)

---

### Part 3: 프론트엔드 (Amplify)

#### 1단계: GitHub 저장소 준비
코드를 GitHub에 푸시했는지 확인

#### 2단계: Amplify 앱 생성
1. AWS Console → "AWS Amplify"
2. "시작하기" → "Amplify Hosting"
3. "GitHub" 선택 → 권한 부여
4. 저장소 선택
5. 브랜치: `main` 선택

#### 3단계: 빌드 설정
1. "앱 설정 편집"
2. 빌드 설정 (`amplify.yml`) 자동 감지
3. 또는 직접 입력:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

#### 4단계: 환경 변수 설정
1. "환경 변수" 탭
2. 변수 추가:
   ```
   VITE_API_URL=https://theranova-backend.ap-northeast-2.elasticbeanstalk.com/api
   ```

#### 5단계: 배포
1. "저장 및 배포" 클릭
2. 빌드 완료까지 3-5분 대기
3. 배포 URL 확인 (예: `https://main.xxxxxx.amplifyapp.com`)

---

### Part 4: CORS 및 최종 설정

#### 1단계: Elastic Beanstalk 환경 변수 업데이트
```
ALLOWED_ORIGINS=https://main.xxxxxx.amplifyapp.com
```

#### 2단계: 커스텀 도메인 (선택)
1. Route 53에서 도메인 구매
2. Amplify → "도메인 관리" → "사용자 지정 도메인 추가"
3. SSL 인증서 자동 발급

---

## 방법 2: AWS Lightsail (올인원) 🚢

### 장점
- 간단한 인터페이스
- 고정 가격 ($5/월부터)
- 올인원 솔루션

### 예상 비용
- $5/월: 1GB RAM, 40GB SSD (개발용)
- $10/월: 2GB RAM, 60GB SSD (프로덕션)

---

### 1단계: Lightsail 인스턴스 생성

#### 1-1. 데이터베이스 생성
1. AWS Console → "Lightsail"
2. "데이터베이스" → "데이터베이스 생성"
3. 설정:
   - **데이터베이스 엔진**: PostgreSQL
   - **플랜**: $15/월 (Standard - 1GB)
   - **데이터베이스 이름**: `theranova-db`
   - **마스터 사용자**: `postgres`
   - **마스터 암호**: 강력한 비밀번호
4. "데이터베이스 생성" 클릭

#### 1-2. 백엔드 인스턴스 생성
1. "인스턴스" → "인스턴스 생성"
2. 설정:
   - **플랫폼**: Linux/Unix
   - **블루프린트**: Node.js
   - **플랜**: $5/월 (1GB RAM)
   - **인스턴스 이름**: `theranova-backend`
3. "인스턴스 생성" 클릭

#### 1-3. 프론트엔드 인스턴스 생성 (선택)
또는 백엔드와 동일 인스턴스에 함께 배포 가능

---

### 2단계: 백엔드 배포

#### 2-1. SSH 연결
1. Lightsail 인스턴스 → "SSH를 사용하여 연결" 클릭
2. 브라우저 기반 SSH 터미널 열림

#### 2-2. 백엔드 코드 업로드
```bash
# Git 설치 (이미 설치됨)
cd /opt/bitnami/projects

# 코드 클론
git clone https://github.com/your-username/theranova.git
cd theranova/backend

# 의존성 설치
npm install

# Prisma 설정
npx prisma generate
```

#### 2-3. 환경 변수 설정
```bash
# .env 파일 생성
nano .env
```

내용 입력:
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:password@your-lightsail-db-endpoint:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-also-32-characters
MOCK_EMAIL=true
ALLOWED_ORIGINS=*
```

저장: `Ctrl + X` → `Y` → `Enter`

#### 2-4. PM2로 백엔드 실행 (영구 실행)
```bash
# PM2 설치
sudo npm install -g pm2

# 백엔드 시작
pm2 start src/server.js --name theranova-backend

# 부팅 시 자동 시작
pm2 startup
pm2 save
```

#### 2-5. 데이터베이스 마이그레이션
```bash
npx prisma migrate deploy
```

---

### 3단계: 프론트엔드 배포

#### 3-1. 프론트엔드 빌드
```bash
cd /opt/bitnami/projects/theranova/frontend

# 환경 변수 설정
echo "VITE_API_URL=http://your-backend-ip:3001/api" > .env

# 의존성 설치 및 빌드
npm install
npm run build
```

#### 3-2. Nginx 설정
```bash
# Nginx 설치
sudo apt update
sudo apt install nginx -y

# Nginx 설정
sudo nano /etc/nginx/sites-available/theranova
```

설정 파일 내용:
```nginx
server {
    listen 80;
    server_name _;

    # 프론트엔드
    location / {
        root /opt/bitnami/projects/theranova/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 백엔드 API 프록시
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

# 기본 설정 제거
sudo rm /etc/nginx/sites-enabled/default

# Nginx 재시작
sudo systemctl restart nginx
```

---

### 4단계: 네트워킹 설정

#### 4-1. 방화벽 규칙
1. Lightsail 인스턴스 → "네트워킹" 탭
2. 방화벽 규칙 추가:
   - **애플리케이션**: HTTP (포트 80)
   - **애플리케이션**: HTTPS (포트 443)
   - **사용자 지정**: TCP 3001 (백엔드 API)

#### 4-2. 고정 IP 할당
1. "네트워킹" → "고정 IP 생성"
2. 인스턴스에 연결
3. IP 주소 복사

---

### 5단계: 도메인 및 SSL (선택)

#### 5-1. 도메인 연결
1. Route 53에서 도메인 구매
2. A 레코드 추가: 고정 IP 입력

#### 5-2. SSL 인증서 (Let's Encrypt)
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

---

## 방법 3: 전문가용 (EC2 + RDS) 💻

### 아키텍처
- **프론트엔드**: S3 + CloudFront
- **백엔드**: EC2 (Auto Scaling)
- **데이터베이스**: RDS PostgreSQL
- **로드 밸런서**: ALB
- **DNS**: Route 53
- **SSL**: ACM

### 장점
- 최고의 성능
- 완벽한 커스터마이징
- 프로덕션 레벨

### 단점
- 복잡한 설정
- 높은 비용 ($100+/월)

---

### 1단계: VPC 설정

#### 1-1. VPC 생성
1. AWS Console → "VPC"
2. "VPC 생성"
3. 설정:
   - **이름**: `theranova-vpc`
   - **IPv4 CIDR**: `10.0.0.0/16`
   - **가용 영역**: 2개
   - **퍼블릭 서브넷**: 2개
   - **프라이빗 서브넷**: 2개
   - **NAT 게이트웨이**: 1개 ($30/월)

---

### 2단계: RDS 설정

#### 2-1. 서브넷 그룹 생성
1. RDS → "서브넷 그룹"
2. "DB 서브넷 그룹 생성"
3. VPC 선택, 프라이빗 서브넷 추가

#### 2-2. RDS 인스턴스 생성
1. "데이터베이스 생성"
2. 설정:
   - **엔진**: PostgreSQL 16
   - **템플릿**: 프로덕션
   - **인스턴스 크기**: db.t3.medium
   - **스토리지**: 100GB, Auto Scaling 활성화
   - **다중 AZ**: 예 (고가용성)
   - **VPC**: theranova-vpc
   - **서브넷 그룹**: 위에서 생성한 것
   - **퍼블릭 액세스**: 아니오

---

### 3단계: EC2 설정

#### 3-1. AMI 준비 (사용자 지정 이미지)
1. EC2 → "인스턴스 시작"
2. **AMI**: Ubuntu Server 22.04 LTS
3. **인스턴스 유형**: t3.medium
4. **키 페어**: 새로 생성 (다운로드)
5. **네트워크**: theranova-vpc, 퍼블릭 서브넷
6. **보안 그룹**:
   - SSH (22) - 내 IP만
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
   - Custom TCP (3001) - ALB만

#### 3-2. 백엔드 설치
SSH 접속:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

설치:
```bash
# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git 설치
sudo apt install git -y

# 코드 클론
git clone https://github.com/your-username/theranova.git
cd theranova/backend

# 의존성 설치
npm install
npx prisma generate

# 환경 변수 설정
nano .env
# (DATABASE_URL, JWT_SECRET 등 입력)

# PM2로 실행
sudo npm install -g pm2
pm2 start src/server.js
pm2 startup
pm2 save
```

#### 3-3. AMI 생성
1. 인스턴스 선택 → "작업" → "이미지 및 템플릿" → "이미지 생성"
2. 이미지 이름: `theranova-backend-v1`

---

### 4단계: Auto Scaling 그룹

#### 4-1. 시작 템플릿 생성
1. EC2 → "시작 템플릿"
2. "시작 템플릿 생성"
3. AMI: 위에서 생성한 이미지
4. 인스턴스 유형: t3.medium

#### 4-2. Auto Scaling 그룹 생성
1. "Auto Scaling 그룹 생성"
2. 시작 템플릿 선택
3. VPC 및 서브넷 선택
4. 로드 밸런서 연결 (다음 단계)
5. 그룹 크기:
   - **원하는 용량**: 2
   - **최소 용량**: 2
   - **최대 용량**: 10
6. 조정 정책: CPU 사용률 70% 초과 시 확장

---

### 5단계: Application Load Balancer

#### 5-1. 대상 그룹 생성
1. EC2 → "대상 그룹"
2. "대상 그룹 생성"
3. 유형: 인스턴스
4. 프로토콜: HTTP, 포트: 3001
5. 상태 검사: `/api/health`

#### 5-2. ALB 생성
1. EC2 → "로드 밸런서"
2. "로드 밸런서 생성" → "Application Load Balancer"
3. 이름: `theranova-alb`
4. 스키마: 인터넷 경계
5. VPC: theranova-vpc
6. 서브넷: 퍼블릭 서브넷 2개
7. 리스너:
   - HTTP:80 → 대상 그룹
   - HTTPS:443 → 대상 그룹 (SSL 인증서 필요)

---

### 6단계: S3 + CloudFront (프론트엔드)

#### 6-1. S3 버킷 생성
1. S3 → "버킷 만들기"
2. 이름: `theranova-frontend`
3. "퍼블릭 액세스 차단" 해제
4. "정적 웹 사이트 호스팅" 활성화

#### 6-2. 프론트엔드 빌드 업로드
```bash
# 로컬에서
cd frontend
npm run build

# AWS CLI로 업로드
aws s3 sync dist/ s3://theranova-frontend/
```

#### 6-3. CloudFront 배포
1. CloudFront → "배포 생성"
2. 원본 도메인: S3 버킷
3. 뷰어 프로토콜 정책: Redirect HTTP to HTTPS
4. SSL 인증서: ACM에서 발급

---

### 7단계: Route 53 (DNS)

#### 7-1. 호스팅 영역 생성
1. Route 53 → "호스팅 영역 생성"
2. 도메인 이름 입력

#### 7-2. 레코드 추가
- **A 레코드** (프론트엔드): CloudFront 배포
- **A 레코드** (api.): ALB

---

## 💰 AWS 비용 예상

### 개발/테스트 환경
- **RDS (db.t3.micro)**: $15/월
- **Elastic Beanstalk (t3.micro)**: $8/월
- **Amplify**: 무료
- **총**: **~$25/월**

### 프로덕션 환경 (Lightsail)
- **데이터베이스**: $15/월
- **백엔드 인스턴스**: $10/월
- **총**: **~$25/월**

### 고성능 프로덕션 (EC2 + RDS)
- **RDS (db.t3.medium, Multi-AZ)**: $150/월
- **EC2 (2 x t3.medium)**: $60/월
- **ALB**: $20/월
- **CloudFront**: $10/월
- **NAT Gateway**: $30/월
- **총**: **~$270/월**

---

## 📊 방법 비교

| 항목 | Amplify + EB | Lightsail | EC2 + RDS |
|------|-------------|-----------|-----------|
| 난이도 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 비용 | $25/월 | $25/월 | $270/월 |
| 성능 | 중 | 중 | 최고 |
| 확장성 | 자동 | 수동 | 자동 |
| 추천 | 입문자 | 중급자 | 전문가 |

---

## 🆘 문제 해결

### RDS 연결 안됨
```bash
# 보안 그룹 확인
# PostgreSQL (5432) 포트 열려있는지 확인

# 엔드포인트 테스트
telnet your-rds-endpoint 5432
```

### Elastic Beanstalk 배포 실패
1. 로그 확인: 환경 → "로그" → "전체 로그"
2. `.ebextensions` 설정 확인
3. Node.js 버전 확인

### Lightsail SSH 접속 불가
1. 인스턴스 재부팅
2. 브라우저 기반 SSH 사용

---

## 📞 추가 리소스

- **AWS 프리 티어**: https://aws.amazon.com/ko/free/
- **AWS 계산기**: https://calculator.aws/
- **AWS 지원**: https://aws.amazon.com/ko/support/

---

## ✅ 추천 방법

### 처음 시작하는 경우
→ **AWS Lightsail** ($25/월)
- 가장 간단
- 고정 가격
- 충분한 성능

### 큰 트래픽 예상
→ **Amplify + Elastic Beanstalk** ($25/월~)
- 자동 확장
- 관리 편함

### 대규모 서비스
→ **EC2 + RDS** ($270/월~)
- 최고 성능
- 완벽한 제어

---

**AWS 배포 성공을 기원합니다! 🚀**
