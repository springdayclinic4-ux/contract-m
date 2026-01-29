#!/bin/bash

# THERANOVA EC2 초기 설정 스크립트
# Ubuntu 22.04 LTS 기준

echo "🚀 THERANOVA EC2 서버 초기 설정 시작..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 에러 발생 시 스크립트 중단
set -e

echo -e "${YELLOW}1. 시스템 업데이트...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${YELLOW}2. Node.js 20.x 설치...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo -e "${YELLOW}3. 필수 패키지 설치...${NC}"
sudo apt install -y git nginx postgresql-client

echo -e "${YELLOW}4. PM2 설치 (프로세스 관리자)...${NC}"
sudo npm install -g pm2

echo -e "${YELLOW}5. 프로젝트 디렉토리 생성...${NC}"
sudo mkdir -p /var/www/theranova
sudo chown -R $USER:$USER /var/www/theranova

echo -e "${YELLOW}6. 방화벽 설정...${NC}"
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3001/tcp  # Backend API
sudo ufw --force enable

echo -e "${YELLOW}7. 스왑 메모리 설정 (성능 향상)...${NC}"
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

echo -e "${YELLOW}8. Git 저장소 클론...${NC}"
read -p "GitHub 저장소 URL을 입력하세요: " REPO_URL
cd /var/www/theranova
git clone $REPO_URL .

echo -e "${YELLOW}9. 백엔드 설정...${NC}"
cd backend
npm install
npx prisma generate

echo -e "${YELLOW}10. 환경 변수 설정...${NC}"
cat > .env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:password@your-rds-endpoint:5432/postgres
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
MOCK_EMAIL=true
ALLOWED_ORIGINS=*
EOF

echo -e "${RED}⚠️  .env 파일을 편집하여 실제 값으로 변경하세요!${NC}"
echo -e "파일 위치: /var/www/theranova/backend/.env"

echo -e "${YELLOW}11. 데이터베이스 마이그레이션...${NC}"
echo -e "${RED}RDS 엔드포인트를 .env에 설정한 후 다음 명령어를 실행하세요:${NC}"
echo -e "cd /var/www/theranova/backend && npx prisma migrate deploy"

echo -e "${YELLOW}12. PM2로 백엔드 시작...${NC}"
pm2 start src/server.js --name theranova-backend
pm2 startup
pm2 save

echo -e "${YELLOW}13. 프론트엔드 빌드...${NC}"
cd ../frontend
npm install
npm run build

echo -e "${YELLOW}14. Nginx 설정...${NC}"
sudo tee /etc/nginx/sites-available/theranova > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 프론트엔드
    location / {
        root /var/www/theranova/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 캐싱 설정
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 백엔드 API 프록시
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 타임아웃 설정
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/api/health;
        access_log off;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/theranova /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo -e "${YELLOW}15. 자동 배포 스크립트 생성...${NC}"
cat > /var/www/theranova/deploy.sh << 'EOF'
#!/bin/bash
set -e
cd /var/www/theranova
git pull origin main
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
pm2 restart theranova-backend
cd ../frontend
npm install
npm run build
sudo systemctl reload nginx
echo "✅ 배포 완료!"
EOF
chmod +x /var/www/theranova/deploy.sh

echo -e "${GREEN}✅ EC2 초기 설정 완료!${NC}"
echo ""
echo -e "${YELLOW}다음 단계:${NC}"
echo "1. /var/www/theranova/backend/.env 파일 편집"
echo "2. cd /var/www/theranova/backend && npx prisma migrate deploy"
echo "3. pm2 restart theranova-backend"
echo ""
echo -e "${GREEN}서버 정보:${NC}"
echo "- 공인 IP: $(curl -s ifconfig.me)"
echo "- 프론트엔드: http://$(curl -s ifconfig.me)"
echo "- 백엔드 API: http://$(curl -s ifconfig.me)/api"
echo ""
echo -e "${YELLOW}PM2 명령어:${NC}"
echo "- 상태 확인: pm2 status"
echo "- 로그 확인: pm2 logs theranova-backend"
echo "- 재시작: pm2 restart theranova-backend"
echo ""
echo -e "${YELLOW}배포 명령어:${NC}"
echo "- 업데이트: /var/www/theranova/deploy.sh"
