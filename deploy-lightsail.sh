#!/bin/bash

# THERANOVA AWS Lightsail 배포 스크립트
# 사용법: ./deploy-lightsail.sh

echo "🚀 THERANOVA Lightsail 배포 시작..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 에러 발생 시 스크립트 중단
set -e

echo -e "${YELLOW}1. Git 저장소 업데이트...${NC}"
cd /opt/bitnami/projects/theranova
git pull origin main

echo -e "${YELLOW}2. 백엔드 빌드...${NC}"
cd backend
npm install
npx prisma generate

echo -e "${YELLOW}3. 데이터베이스 마이그레이션...${NC}"
npx prisma migrate deploy

echo -e "${YELLOW}4. 백엔드 재시작...${NC}"
pm2 restart theranova-backend

echo -e "${YELLOW}5. 프론트엔드 빌드...${NC}"
cd ../frontend
npm install
npm run build

echo -e "${YELLOW}6. Nginx 재시작...${NC}"
sudo systemctl reload nginx

echo -e "${GREEN}✅ 배포 완료!${NC}"
echo -e "프론트엔드: http://$(curl -s ifconfig.me)"
echo -e "백엔드 API: http://$(curl -s ifconfig.me)/api"

# 로그 확인
echo -e "${YELLOW}백엔드 로그 (최근 20줄):${NC}"
pm2 logs theranova-backend --lines 20
