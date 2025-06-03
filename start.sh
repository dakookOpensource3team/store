#!/bin/bash

# Store Application 실행 스크립트

echo "Store Application 시작..."

# .env 파일 확인
if [ ! -f .env ]; then
    echo ".env 파일 생성..."
    cat > .env << EOF
# MySQL 설정
MYSQL_ROOT_PASSWORD=zaq2419926!

# JWT 설정
JWT_SECRET=TaeWooTaeWooSecretKeyForJWT
JWT_EXPIRES=86400000
EOF
    echo ".env 파일이 생성되었습니다."
fi

# 1. 백엔드 애플리케이션 빌드

echo "백엔드 애플리케이션 빌드 중..."
(cd store_backend && ./gradlew build -x test)
if [ $? -ne 0 ]; then
    echo "백엔드 빌드에 실패했습니다. 스크립트를 중단합니다."
    exit 1
fi
echo "백엔드 빌드 완료."

# 2. 전체 Docker Compose 실행

echo "Docker Compose 전체 서비스 시작..."
docker-compose up --build

echo "애플리케이션이 시작되었습니다!"
echo "프론트엔드: http://localhost"
echo "백엔드 API: http://localhost:8080"
echo "Swagger UI: http://localhost:8080/swagger-ui.html" 