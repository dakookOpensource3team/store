# 멀티스테이지 빌드를 위한 Dockerfile

# Stage 1: 빌드 스테이지
FROM node:18-alpine as build

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사 (캐시 최적화)
COPY package*.json ./

# 의존성 설치 (빌드에 필요한 devDependencies 포함)
RUN npm ci

# 소스코드 복사
COPY . .

# 프로덕션 빌드
RUN npm run build

# Stage 2: 서빙 스테이지
FROM nginx:alpine

# 빌드된 파일을 nginx 웹서버로 복사
COPY --from=build /app/dist /usr/share/nginx/html

# nginx 설정 파일 복사 (SPA를 위한 설정)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# nginx 실행
CMD ["nginx", "-g", "daemon off;"] 